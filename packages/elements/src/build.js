var matchdom = require('matchdom');
var domify = require('domify');

Object.assign(matchdom.filters, require('./filters'));

var parser = new DOMParser();

Document.prototype.dom = function(str) {
	if (/^\s*<html[\s>]/.test(str)) {
		var ndoc = parser.parseFromString(str, 'text/html');
		return this.adoptNode(ndoc.documentElement);
	}
	return domify(Array.prototype.join.call(arguments, '\n'), this);
};

Node.prototype.dom = function() {
	return domify(Array.prototype.join.call(arguments, '\n'), this.ownerDocument);
};

String.prototype.fuse = Node.prototype.fuse = function(obj, scope, filters) {
	return matchdom(this, obj, filters, {data: scope});
};

var mSym = matchdom.Symbols;
var reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

module.exports = function(pathname, query, elem) {
	var view = Pageboard.view;
	var elts = view.elements;
	return Promise.resolve().then(function() {
		return Pageboard.fetch("get", pathname, query).then(function(res) {
			var p = res.elements ? Pageboard.script(res.elements) : Promise.resolve();
			return p.then(function() {
				return res;
			});
		}).catch(function(err) {
			err.type = 'error';
			return { data: err };
		});
	}).then(function(res) {
		var block = res.data;
		var type = null;
		if (elem) {
			type = elem.name;
			view.elements[type] = elem;
		} else if (block && block.type) {
			type = block.type;
			elem = view.elements[type];
		}
		if (Array.isArray(block)) {
			block = {
				type: type,
				data: res.data
			};
		}

		var scope = {
			$query: query,
			$pathname: pathname,
			$hrefs: res.hrefs || {},
			$links: res.links || {},
			$site: res.site,
			$elements: elts,
			$doc: view.doc
		};

		Object.keys(elts).forEach(function(name) {
			var el = elts[name];
			if (el.$installed) return;
			el.$installed = true;
			if (el.install) el.install.call(el, view.doc, block, scope);
			if (!el.render && el.html) el.render = function(doc, block, view, scope) {
				var dom = doc.dom(el.html);
				if (dom && dom.nodeName == 'HTML') {
					doc.replaceChild(dom, doc.documentElement);
				}
				var rscope = Object.assign({}, scope, {
					$schema: el.properties,
					$id: block.id
				});
				if (el.fuse) dom = el.fuse.call(el, dom, block.data, rscope) || dom;
				else if (reFuse.test(el.html)) dom = dom.fuse(block.data, rscope, el.filters);
				return dom;
			};
		});

		return view.from(block, null, type, scope);
	});
};
