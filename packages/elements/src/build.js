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

Node.prototype.fuse = function(obj, scope, filters) {
	return matchdom(this, obj, filters, {data: scope});
};
String.prototype.fuse = function(obj, scope, filters) {
	return matchdom(this.toString(), obj, filters, {data: scope});
};

var mSym = matchdom.Symbols;
var reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);
var cache = {};

module.exports = function(opts) {
	var view = Pageboard.view;
	var elts = view.elements;
	var elem = opts.element;
	var state = opts.state || {};

	return Promise.resolve().then(function() {
		if (opts.data) return opts.data;
		if (!opts.pathname) return {};
		return Pageboard.fetch("get", opts.pathname, opts.query).then(function(res) {
			var meta = res.meta || {};
			var p;
			if (meta.elements) {
				if (!cache[meta.elements]) {
					cache[meta.elements] = Pageboard.load.js(meta.elements);
				}
				if (meta.group != "page") {
					if (meta.stylesheets) meta.stylesheets.forEach(function(url) {
						Pageboard.load.css(url);
					});
					if (meta.scripts) meta.scripts.forEach(function(url) {
						Pageboard.load.js(url);
					});
				}
				p = cache[meta.elements];
			} else {
				p = Promise.resolve();
			}
			return p.then(function() {
				return res;
			});
		}).catch(function(err) {
			return { item: {
				type: 'error',
				data: {
					name: err.name,
					message: err.message,
					stack: err.stack,
					status: err.status
				}
			} };
		});
	}).then(function(res) {
		var block = res.item || {};
		if (!block.type && elem) {
			block.type = elem.name;
			if (!block.type) console.warn("Pageboard.build expects element.name to be set", elem);
			elts[block.type] = elem;
		} else if (block.type) {
			elem = elts[block.type];
		}
		if (res.items) block.children = res.items;


		var query = state.query || {};
		if (query.develop === null || query.develop == "write") {
			state.vars.develop = true;
		}
		var writeMode = elem && elem.group == "page" && query.develop == "write";

		var scope = {
			$write: writeMode,
			$query: query,
			$pathname: state.pathname,
			$elements: elts,
			$doc: view.doc
		};

		Object.keys(res).forEach(function(name) {
			if (name != "item" && scope['$'+name] === undefined) scope['$'+name] = res[name];
		});

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

		return view.from(block, null, block.type, scope).then(function(node) {
			return {node: node, data:res};
		});
	});
};
