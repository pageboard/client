const matchdom = require('matchdom');
const Viewer = require('@pageboard/pagecut/src/viewer.js');
const str2dom = require('@pageboard/pagecut/src/str2dom.js');

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
	// eslint-disable-next-line no-console
	if (!scope) console.warn("Missing scope param");
	return matchdom(this, obj, scope.$filters, {data: scope});
};
String.prototype.fuse = function(obj, scope) {
	if (obj == null && scope == null) return reFuse.test(this.toString());
	return matchdom(this.toString(), obj, scope ? scope.$filters : null, {data: scope});
};

const mSym = matchdom.Symbols;
const reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

module.exports = function(res, scope, el) {
	const elts = scope.$elements;
	if (!res) res = {};

	if (!scope.$view) scope.$view = new Viewer({
		elements: elts,
		doc: scope.$doc
	});

	if (el) install(el, scope);

	scope = Object.assign({}, scope);
	for (const k in res) scope[`$${k}`] = res[k];

	const block = res.item || {};
	const blocks = {};
	if (!el && block.type) {
		el = elts[block.type];
	}
	if (res.items) {
		res.items.forEach((child) => {
			blocks[child.id] = child;
			// this case should actually be res.item.children (like blocks.search api)
			// but page.get api returns res.item/res.items and we can't change it in a compatible way.
			if (child.children && !res.item) {
				child.children.forEach((child) => {
					blocks[child.id] = child;
				});
			}
		});
	}
	return scope.$view.from(block, blocks, {
		type: el.name,
		element: el,
		scope: scope,
		strip: !scope.$write
	});
};

module.exports.install = install;

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
		if (el.fragments) el.fragments.forEach((obj) => {
			let target;
			if (obj.type === 'doc') target = scope.$element;
			else if (obj.type) target = scope.$elements[obj.type] || {};
			else target = el;
			if (!target.dom) {
				// eslint-disable-next-line no-console
				console.warn("dom not found for fragment", obj.type, el.name);
			} else {
				let node = obj.path ? target.dom.querySelector(obj.path) : target.dom;
				if (node) {
					if (obj.html) {
						node.insertAdjacentHTML(obj.position || 'afterend', obj.html);
					}
					if (obj.attributes) Object.keys(obj.attributes).forEach(key => {
						node.setAttribute(key, obj.attributes[key]);
					});
				} else {
					// eslint-disable-next-line no-console
					console.warn("path not found", obj.path, "in", el.name, el.html);
				}
			}
		});
		if (el.install && scope.$element) {
			el.install.call(el, scope);
		}
	} catch(err) {
		// eslint-disable-next-line no-console
		console.error("Invalid element", el, err);
		return;
	}

	if (!el.dom) return;
	el.render = function(block, bscope) {
		const el = this;
		if (!block) block = {};
		const rscope = Object.assign({}, scope, bscope, {
			$element: el
		});
		["id", "type", "parent", "child", "parents", "children", "updated_at", "created_at", "lock", "expr"].forEach(function(name) {
			const val = block[name];
			if (val != null) rscope['$' + name] = val;
		});

		if (el.filters) rscope.$filters = Object.assign({}, rscope.$filters, el.filters);

		const data = Pageboard.merge(block.data, block.expr, function (c, v) {
			if (typeof v != "string") return;
			return v.fuse({
				$default: c
			}, {
				$filters: {
					magnet: function (val) {
						return val;
					},
					bmagnet: function (val) {
						return;
					},
					attr: function (val) {
						return val;
					},
					'||': function (val, what) {
						if (what.expr.path[0] != "$default") {
							what.cancel = true;
						}
						return val;
					}
				}
			});
		});
		let dom = el.dom && el.dom.cloneNode(true);
		if (el.fuse) {
			dom = el.fuse.call(el, dom, data, rscope) || dom;
		} else if (el.fusable) {
			if (!dom) throw new Error("Invalid element", el, "missing dom");
			dom = dom.fuse(data, rscope);
			if (!dom) return;
			let list = dom;
			if (dom.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
				list = [dom];
			} else {
				list = dom.children;
			}
			list.forEach((dom) => {
				Array.from(dom.attributes).forEach(attr => {
					if (!attr.name.startsWith('style-')) return;
					const style = attr.name.split('-').slice(1).map((w, i) => {
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

