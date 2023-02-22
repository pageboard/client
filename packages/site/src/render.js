import {
	Matchdom,
	TextPlugin,
	OpsPlugin,
	NumPlugin,
	ArrayPlugin,
	DomPlugin,
	DatePlugin,
	JsonPlugin
} from 'matchdom';

import Viewer from '@pageboard/pagecut/src/viewer.js';
import str2dom from '@pageboard/pagecut/src/str2dom.js';

import * as matchdomPlugin from './plugin';

const matchdom = new Matchdom(TextPlugin, OpsPlugin, NumPlugin, ArrayPlugin, DomPlugin, DatePlugin, JsonPlugin, matchdomPlugin);

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

const mSym = Matchdom.Symbols;
const reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

const fuse = (obj, data, scope) => {
	const md = new Matchdom(matchdom, {
		filters: scope.$filters,
		hooks: scope.$hooks,
		formats: scope.$formats
	});
	return md.merge(obj, data, scope);
};

Node.prototype.fuse = function (data, scope) {
	// eslint-disable-next-line no-console
	if (!scope) console.warn("Missing scope param");
	return fuse(this, data, scope);
};
String.prototype.fuse = function(data, scope, plugin) {
	if (data == null && scope == null) return reFuse.test(this.toString());
	return fuse(this.toString(), data, scope);
};


export function render(res, scope, el) {
	const elts = scope.$elements;
	if (!res) res = {};

	if (!scope.$view) scope.$view = new Viewer({
		elements: elts,
		doc: scope.$doc
	});

	if (el) install(el, scope);

	scope = scope.copy();

	const block = res.item ?? res;
	// fixme
	// api should always reply with some kind of block,
	// knowing that merge(block.data) and scope contains other keys of the block,
	// prefixed with $
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

function renderBlock(el, scope, block, bscope) {
	if (!block) block = {};

	const rscope = scope.copy(bscope);

	rscope.$element = el;

	for (const name of ["id", "type", "parent", "child", "parents", "children", "updated_at", "created_at", "lock", "expr", "items"]) {
		const val = block[name];
		if (val != null) rscope['$' + name] = val;
	}

	if (el.filters) rscope.$filters = { ...rscope.$filters, ...el.filters };
	if (el.hooks) rscope.$hooks = { ...rscope.$hooks, ...el.hooks };
	if (el.formats) rscope.$formats = { ...rscope.$formats, ...el.types };

	const data = block.expr ? Pageboard.merge(block.data, block.expr, (c, v) => {
		if (typeof v != "string") return;
		return v.fuse({}, {
			$default: c,
			$filters: {
				at: function (ctx, val) {
					return ctx.raw;
				},
				prune: function (ctx, val) {
					return ctx.raw;
				},
				to: function (ctx, val) {
					return ctx.raw;
				}
			},
			$hooks: {
				afterAll: function (ctx, val) {
					if (ctx.expr.path[0] != "$default") {
						ctx.expr.cancel = true;
					}
					return val;
				}
			}
		});
	}) : block.data;

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
					if (i > 0) w = w[0].toUpperCase() + w.slice(1);
					return w;
				}).join("");
				node.style[style] = attr.value;
				node.removeAttribute(attr.name);
			}
		}
	}
	return dom;
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
				else if (obj.type) target = scope.$elements[obj.type] ?? {};
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
								if (key == "className") {
									node.classList.add(...attr.split(' '));
								} else {
									node.setAttribute(key, attr);
								}
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
	el.render = (block, bscope) => {
		return renderBlock(el, scope, block, bscope);
	};
}

