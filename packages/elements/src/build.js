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

module.exports = function(opts) {
	var view = Pageboard.view;
	var elts = view.elements;
	var elem = opts.element;

	return Promise.resolve().then(function() {
		if (!opts.pathname) return {};
		return Pageboard.fetch("get", opts.pathname, opts.query).then(function(res) {
			var elPath = res.elements;
			var p;
			if (elPath && (!elem || elem.contents)) {
				console.log("Loading", elPath);
				if (!view.bundles[elPath]) {
					view.bundles[elPath] = Pageboard.script(elPath);
				}
				p = view.bundles[elPath];
			} else {
				p = Promise.resolve();
			}
			return p.then(function() {
				return res;
			});
		}).catch(function(err) {
			err.type = 'error';
			return { data: err };
		});
	}).then(function(res) {
		if (opts.transform) opts.transform(res);
		var block = res.data || {};
		var type = null;
		if (elem) {
			type = elem.name;
			if (!type) console.warn("Pageboard.build expects element.name to be set", elem);
			view.elements[type] = elem;
		} else if (block && block.type) {
			type = block.type;
			elem = view.elements[type];
		}
		if (Array.isArray(block)) {
			block = {
				type: type,
				children: res.data
			};
		} else if (!block.type) {
			block.type = type;
		}

		var query = opts.state.query || {};
		var writeMode = elem && elem.group == "page" && query.develop == "write";

		var scope = {
			$write: writeMode,
			$query: query,
			$pathname: opts.state.pathname,
			$hrefs: res.hrefs || {},
			$links: res.links || {},
			$site: res.site || {},
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
				var rscope = Object.assign({}, scope, {
					$element: el,
					$id: block.id
				});
				if (el.fuse) dom = el.fuse.call(el, dom, block.data, rscope) || dom;
				else if (reFuse.test(el.html)) dom = dom.fuse(block.data, rscope, el.filters);
				return dom;
			};
		});

		return view.from(block, null, type, scope).then(function(node) {
			if (writeMode && window.parent.Pageboard.install) {
				window.parent.Pageboard.install(node, block);
			}
			return node;
		});
	});
};
