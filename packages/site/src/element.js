import Element from '@pageboard/pagecut/src/element.js';
import str2dom from '@pageboard/pagecut/src/str2dom.js';

export class CustomElement extends Element {
	#ready;
	#scope;

	init(scope) {
		this.#scope = scope;
		if (this.#ready) return true;
		this.#ready = true;
		try {
			if (this.html != null) {
				this.dom = str2dom(this.html, {
					doc: scope.$doc,
					ns: this.ns
				});
				this.fusable = this.html.fuse();
			} else {
				this.fusable = true;
			}
			if (this.fragments && insertFragments(scope, this)) {
				// reparse
				this.dom = str2dom(this.dom.outerHTML, {
					doc: scope.$doc,
					ns: this.ns
				});
			}
		} catch (err) {
			// eslint-disable-next-line no-console
			console.error("Invalid element", this, err);
		}
	}
	render(block, bscope) {
		const scope = this.#scope;
		const el = this;
		if (!block) block = {};

		const rscope = scope.copy(bscope);

		rscope.$element = el;

		for (const name of ["id", "type", "parent", "child", "parents", "children", "updated_at", "created_at", "lock", "expr", "content"]) {
			const val = block[name];
			if (val !== undefined) rscope['$' + name] = val;
		}

		if (el.filters) rscope.$filters = { ...rscope.$filters, ...el.filters };
		if (el.hooks) rscope.$hooks = { ...rscope.$hooks, ...el.hooks };
		if (el.formats) rscope.$formats = { ...rscope.$formats, ...el.types };

		const data = block.expr ? merge(block.data, block.expr, (c, v) => {
			if (typeof v != "string") return;
			return v.fuse({}, {
				$default: c,
				$hooks: {
					afterAll: function (ctx, val) {
						if (ctx.expr.path[0] != "$default") {
							ctx.expr.cancel = true;
						}
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
					node.style.setProperty(attr.name.slice(6), attr.value);
					node.removeAttribute(attr.name);
				}
			}
		}
		return dom;
	}
}

function insertFragments(scope, el) {
	// fragments can only be added on elements that have not yet been rendered
	let reparse = false;
	for (const obj of el.fragments) {
		let target;
		if (obj.type === 'doc') {
			target = scope.$element;
		} else if (obj.type) {
			target = scope.$elements[obj.type] ?? {};
		} else {
			target = el;
		}
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
	return reparse;
}


function merge(obj, extra, fn) {
	const single = arguments.length == 2;
	if ((fn == null || single) && typeof extra == "function") {
		fn = extra;
		extra = obj;
		obj = {};
	}
	if (!extra) return obj;
	const copy = { ...obj };
	for (const [key, val] of Object.entries(extra)) {
		if (val == null) {
			continue;
		} else if (typeof val == "object") {
			copy[key] = single ? merge(val, fn) : merge(copy[key], val, fn);
		} else if (fn) {
			copy[key] = single ? fn(val) : fn(copy[key], val);
		} else {
			copy[key] = val;
		}
	}
	return copy;
}

