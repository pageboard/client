import matchdom from 'matchdom';
import Viewer from '@pageboard/pagecut/src/viewer.js';
import str2dom from '@pageboard/pagecut/src/str2dom.js';

import * as filters from './filters';
Object.assign(matchdom.filters, filters);

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

const mSym = matchdom.Symbols;
const reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

Node.prototype.fuse = function(obj, scope) {
	// eslint-disable-next-line no-console
	if (!scope) console.warn("Missing scope param");
	return matchdom(this, obj, scope.$filters, {data: scope});
};
String.prototype.fuse = function(obj, scope) {
	if (obj == null && scope == null) return reFuse.test(this.toString());
	return matchdom(this.toString(), obj, scope ? scope.$filters : null, {data: scope});
};



export function render(res, scope, el) {
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
		for (const child of res.items) {
			blocks[child.id] = child;
			// this case should actually be res.item.children (like blocks.search api)
			// but page.get api returns res.item/res.items and we can't change it in a compatible way.
			if (child.children && !res.item) {
				for (const item of child.children) {
					blocks[item.id] = item;
				}
			}
		}
	}
	return scope.$view.from(block, blocks, {
		type: el.name,
		element: el,
		scope: scope,
		strip: !scope.$write
	});
}

export function install(el, scope) {
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
		if (el.fragments) {
			let reparse = false;
			for (const obj of el.fragments) {
				let target;
				if (obj.type === 'doc') target = scope.$element;
				else if (obj.type) target = scope.$elements[obj.type] || {};
				else target = el;
				if (!target.dom) {
					// eslint-disable-next-line no-console
					console.warn("dom not found for fragment", obj.type, el.name);
				} else {
					const node = obj.path ? target.dom.querySelector(obj.path) : target.dom;
					if (node) {
						if (obj.html) {
							node.insertAdjacentHTML(obj.position || 'afterend', obj.html);
							if (obj.html.fuse()) el.fusable = true;
						}
						if (obj.attributes) {
							for (const [key, attr] of Object.entries(obj.attributes)) {
								if (key == "is" && attr) reparse = true;
								node.setAttribute(key, attr);
								if (attr.fuse()) el.fusable = true;
							}
						}
					} else {
						// eslint-disable-next-line no-console
						console.warn("path not found", obj.path, "in", el.name, el.html);
					}
				}
			}
			if (reparse) el.dom = str2dom(el.dom.outerHTML, {
				doc: scope.$doc,
				ns: el.ns
			});
		}
		if (el.install && scope.$element) {
			el.install(scope);
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
		for (const name of ["id", "type", "parent", "child", "parents", "children", "updated_at", "created_at", "lock", "expr"]) {
			const val = block[name];
			if (val != null) rscope['$' + name] = val;
		}

		if (el.filters) rscope.$filters = Object.assign({}, rscope.$filters, el.filters);

		const data = Pageboard.merge(block.data, block.expr, (c, v) => {
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
			dom = el.fuse(dom, data, rscope) || dom;
		} else if (el.fusable) {
			if (!dom) throw new Error("Invalid element", el, "missing dom");
			dom = dom.fuse(data, rscope);
			if (!dom) return;
			let list;
			if (dom.nodeType != Node.DOCUMENT_FRAGMENT_NODE) {
				list = [dom];
			} else {
				list = Array.from(dom.children);
			}
			for (const node of list) {
				for (const attr of Array.from(node.attributes)) {
					if (!attr.name.startsWith('style-')) continue;
					const style = attr.name.split('-').slice(1).map((w, i) => {
						if (i > 0) w = w[0].toUpperCase() + w.substr(1);
						return w;
					}).join("");
					node.style[style] = attr.value;
					node.removeAttribute(attr.name);
				}
			}
		}
		return dom;
	};
}

