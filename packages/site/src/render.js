var matchdom = require('matchdom');
var Viewer = require('@pageboard/pagecut/src/viewer.js');
var str2dom = require('@pageboard/pagecut/src/str2dom.js');

Object.assign(matchdom.filters, require('./filters'));

Document.prototype.dom = function(str) {
	return str2dom(Array.prototype.join.call(arguments, '\n'), {
		doc: this
	});
};

Document.prototype.fuse = XMLDocument.prototype.fuse = function(obj, scope) {
	this.documentElement.fuse(obj, scope);
	return this;
};

Node.prototype.dom = function() {
	return str2dom(Array.prototype.join.call(arguments, '\n'), {
		doc: this.ownerDocument,
		ns: this.namespaceURI
	});
};

Node.prototype.fuse = function(obj, scope) {
	if (!scope) console.warn("Missing scope param");
	return matchdom(this, obj, scope.$filters, {data: scope});
};
String.prototype.fuse = function(obj, scope) {
	if (obj == null && scope == null) return reFuse.test(this.toString());
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
			el.dom = str2dom(el.html, {
				doc: scope.$doc,
				ns: el.ns
			});
			el.fusable = el.html.fuse();
		} else {
			el.fusable = true;
		}
		if (el.install && scope.$element) {
			el.install.call(el, scope);
		}
	} catch(err) {
		console.error("Invalid element", el, err);
		return;
	}

	if (!el.dom) return;
	el.render = function(block, bscope) {
		var el = this;
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
						var path = what.scope.path;
						if (path[0] == '$default') {
							useDefault = true;
						} else if (path.length == 1) {
							// do not drop undefined
							what.cancel = true;
						}
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
			if (!dom) return;
			var list = dom;
			if (dom.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
				list = [dom];
			} else {
				list = Array.from(dom.children);
			}
			list.forEach((dom) => {
				Array.from(dom.attributes).forEach(attr => {
					if (!attr.name.startsWith('style-')) return;
					var style = attr.name.split('-').slice(1).map((w, i) => {
						if (i > 0) w = w[0].toUpperCase() + w.substr(1);
						return w;
					}).join("");
					dom.style[style] = attr.value;
					dom.removeAttribute(attr.name);
				});
			});
		}
		return dom;
	};
}

