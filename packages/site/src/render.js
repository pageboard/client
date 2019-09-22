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
	if (!res) res = {};

	if (!scope.$view) scope.$view = new Viewer({
		elements: elts,
		doc: scope.$doc
	});

	if (elem) install(elem, scope);

	scope = Object.assign({}, scope);
	for (var k in res) scope[`$${k}`] = res[k];

	var block = res.item || {};
	var blocks = {};
	if (elem) {
		scope.$view.setElement(elem);
		if (!block.type) block.type = elem.name;
		if (res.items) {
			if (block.standalone) {
				block.children = res.items;
			} else {
				importBlocks(res.items, blocks);
			}
		}
	} else if (block.type) {
		elem = elts[block.type];
	}
	return scope.$view.from(block, blocks, {
		type: elem.name,
		scope: scope,
		strip: !scope.$write
	});
};

module.exports.install = install;

function importBlocks(children, blocks) {
	children.forEach((child) => {
		blocks[child.id] = child;
		if (child.children) {
			importBlocks(child.children, blocks);
			delete child.children;
		}
	});
}

function install(el, scope) {
	if (el.$installed) return;
	el.$installed = true;
	try {
		if (el.html != null) {
			el.dom = scope.$doc.dom(el.html);
			el.fusable = reFuse.test(el.html);
		} else {
			el.fusable = true;
		}
		if (el.install) el.install.call(el, scope);
	} catch(err) {
		console.error("Invalid element", el, err);
		return;
	}

	if (!el.dom) return;
	el.render = function(block, bscope) {
		if (!block) block = {};
		var rscope = Object.assign({}, scope, bscope, {
			$element: el
		});
		["id", "parent", "child", "parents", "children", "updated_at", "created_at", "lock"].forEach(function(name) {
			var val = block[name];
			if (val !== undefined) rscope['$'+name] = val;
		});

		if (el.filters) rscope.$filters = Object.assign({}, rscope.$filters, el.filters);

		var data = Pageboard.merge(block.data, block.expr, function(c, v) {
			var useDefault = false;
			var nv;
			if (typeof v == "string" && c != null) {
				nv = v.fuse({$default: c}, { $filters: {
					'||': function(val, what) {
						if (!useDefault) useDefault = what.expr.path[0] == '$default';
						return val;
					}
				}});
			}
			if (useDefault) return nv;
		});
		var dom = el.dom && el.dom.cloneNode(true);
		if (el.fuse) {
			dom = el.fuse.call(el, dom, data, rscope) || dom;
		} else if (el.fusable) {
			if (!dom) throw new Error("Invalid element", el, "missing dom");
			dom = dom.fuse(data, rscope);
		}
		return dom;
	};
}

