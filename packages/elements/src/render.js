var matchdom = require('matchdom');
var domify = require('domify');
var Viewer = require('@pageboard/pagecut/src/viewer.js');

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

Node.prototype.fuse = function(obj, scope) {
	if (!scope) console.warn("Missing scope param");
	return matchdom(this, obj, scope.$filters, {data: scope});
};
String.prototype.fuse = function(obj, scope) {
	return matchdom(this.toString(), obj, scope ? scope.$filters : null, {data: scope});
};

var mSym = matchdom.Symbols;
var reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

module.exports = function(res, scope) {
	var elts = scope.$elements;
	var elem = scope.$element;

	scope.$view = new Viewer({
		elements: elts,
		doc: scope.$doc
	});
	if (elem) install(elem, scope);

	res = Object.assign({}, res);
	var block = res.item || {};
	delete res.item;
	if (!block.type && elem) {
		block.type = elem.name;
		if (!block.type) console.warn("Pageboard.build expects element.name to be set", elem);
		elts[block.type] = elem;
	} else if (block.type) {
		elem = elts[block.type];
	}

	if (block.data) {
		if (res.items) {
			block.children = res.items;
			delete res.items;
		}
	} else {
		block.data = {
			items: res.items
		};
		delete res.items;
	}
	block.scope = res;

	return scope.$view.from(block, null, block.type);
};

module.exports.install = install;

function install(el, scope) {
	if (el.$installed) return;
	el.$installed = true;
	try {
		if (el.html != null) el.dom = scope.$doc.dom(el.html);
		if (el.install) el.install.call(el, scope);
	} catch(err) {
		console.error("Invalid element", el, err);
		return;
	}
	if (el.dom) el.render = function(block) {
		var dom = el.dom.cloneNode(true);

		var rscope = Object.assign({}, scope, {
			$element: el,
			$id: block.id,
		});
		if (block.scope) Object.keys(block.scope).forEach(function(name) {
			if (rscope[name] === undefined) {
				rscope['$'+name] = block.scope[name];
			}
		});
		if (el.filters) rscope.$filters = Object.assign({}, rscope.$filters, el.filters);

		var data = Pageboard.merge(block.data, block.expr, function(c, v) {
			if (v != null) return v.fuse({$default: c}, rscope);
		});

		if (el.fuse) {
			dom = el.fuse.call(el, dom, data, rscope) || dom;
		} else if (!el.html || reFuse.test(el.html)) {
			dom = dom.fuse(data, rscope);
		}
		return dom;
	};
}

