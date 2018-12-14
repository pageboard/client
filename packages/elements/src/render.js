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
	if (!scope) console.warn("Missing scope param");
	return matchdom(this, obj, filters, {data: scope});
};
String.prototype.fuse = function(obj, scope, filters) {
	if (!scope) console.warn("Missing scope param");
	return matchdom(this.toString(), obj, filters, {data: scope});
};

var mSym = matchdom.Symbols;
var reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

module.exports = function(res, scope) {
	var elts = scope.$elements;
	var elem = scope.$element;
	if (elem) install(elem, scope);

	var block = res.item || {};
	if (!block.type && elem) {
		block.type = elem.name;
		if (!block.type) console.warn("Pageboard.build expects element.name to be set", elem);
		elts[block.type] = elem;
	} else if (block.type) {
		elem = elts[block.type];
	}
	if (res.items) block.children = res.items;

	return Pageboard.view.from(block, null, block.type);
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
		var data = block.data;
		if (block.expr && !scope.$write) {
			data = merge(data, block.expr);
		}
		var dom = el.dom.cloneNode(true);
		var rscope = Object.assign({}, scope, {
			$element: el,
			$id: block.id
		});
		if (el.fuse) {
			dom = el.fuse.call(el, dom, data, rscope) || dom;
		} else if (reFuse.test(el.html)) {
			dom = dom.fuse(data, rscope, el.filters);
		}
		return dom;
	};
}

function merge(data, expr) {
	var copy = Object.assign({}, data);
	Object.keys(expr).forEach(function(key) {
		var val = expr[key];
		if (val == null) return;
		else if (typeof val == "object") {
			copy[key] = merge(copy[key], val);
		} else {
			copy[key] = val;
		}
	});
	return copy;
}
