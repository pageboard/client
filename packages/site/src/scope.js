import Viewer from '@pageboard/pagecut/src/viewer.js';
import BlocksView from '@pageboard/pagecut/src/blocks-view.js';

import * as fuse from './fuse';
import * as load from './load';
import { CustomElement } from './element';

class CustomViewer extends Viewer {
	element(type) {
		if (!type) return;
		let el = this.elements[type];
		if (!el) {
			console.warn("Unknown element", type);
			return;
		}
		if (!(el instanceof CustomElement)) {
			el.name ??= type;
			el = this.elements[el.name] = new CustomElement(el);
		}
		el.init(this.scope);
		return el;
	}

	setElement(el) {
		if (!el.name) throw new Error("Element must have a name");
		if (!(el instanceof CustomElement)) el = new CustomElement(el);
		el.init(this.scope);
		this.elements[el.name] = el;
		return el;
	}

	prepare() {
		for (const name in this.elements) this.element(name);
	}

	init() {
		const bundles = [];
		for (const [name, el] of Object.entries(this.elements)) {
			if (el.bundle) bundles.push(name);
		}

		const bbg = this.groups = new Map();
		const bbe = this.bundlesByElement = new Map();
		for (const root of bundles) {
			const rootEl = this.elements[root];
			if (!rootEl) continue;
			rootEl.groups = new Set();
			for (const name of rootEl.bundle) {
				const el = this.elements[name];
				el.name = name;
				let list = bbe.get(name);
				if (!list) bbe.set(name, list = new Set());
				list.add(root);

				if (el.group) for (const group of el.group.split(/\s+/)) {
					rootEl.groups.add(group);
					let groupBundles = bbg.get(group);
					if (!groupBundles) bbg.set(group, groupBundles = new Set());
					groupBundles.add(root);
				}
			}
		}
	}
}

const baseElements = {
	error: {
		name: 'error',
		scripts: [],
		stylesheets: [],
		html: `<html>
		<head>
			<title>[status|or:500] [statusText|or:Error]</title>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta name="robots" content="noindex">
			<meta http-equiv="Status" content="[status|or:500] [statusText|or:Error]">
		</head>
		<body>
			<h2>[body|else:get:statusText]</h2>
			<p><code>[stack|fail:p]</code></p>
		</body></html>`
	}
};

export default class Scope {
	#state;

	static init(state) {
		const elts = Pageboard.schemas?.elements?.definitions ?? {};
		Object.assign(elts, baseElements);

		let { scope } = state;
		if (state.pathname == state.referrer?.pathname && !state.data.response && state.referrer.data.response) {
			state.data.response = state.referrer.data.response;
			scope = state.scope = state.referrer.scope.copy();
		}

		if (!scope || !(scope instanceof Scope)) {
			scope = state.scope = new Scope(state, {
				$filters: {},
				$elements: elts
			});
		} else {
			scope.#state = state;
		}

		return scope;
	}

	constructor(state, obj = {}) {
		this.#state = state;
		Object.assign(this, obj);
	}

	get $loc() {
		return this.#state;
	}
	get $pathname() {
		return this.#state.pathname;
	}
	get $query() {
		return this.#state.query;
	}
	get $referrer() {
		return this.#state.referrer;
	}
	get $doc() {
		return this.#state.doc;
	}
	get $hrefs() {
		if (!this.#state.hrefs) this.#state.hrefs = {};
		return this.#state.hrefs;
	}
	set $hrefs(obj) {
		Object.assign(this.$hrefs, obj);
	}
	set $doc(v) {
		// ignore it
	}
	get $elements() {
		return this.viewer.elements;
	}
	set $elements(elts) {
		if (elts == this.viewer?.elements) return;
		const v = this.viewer = new CustomViewer({
			elements: elts,
			document: this.$doc,
			scope: this
		});
		v.blocks = new BlocksView(v);
	}

	get $groups() {
		return this.viewer.groups;
	}

	var(name) {
		this.#state.vars[name] = true;
	}
	copy(extra) {
		const scope = new Scope(this.#state, this);
		scope.viewer = this.viewer;
		scope.viewer.scope = this;
		if (extra) Object.assign(scope, extra);
		return scope;
	}

	async #install(types, to) {
		const bundles = new Set();
		const els = this.$elements;
		for (const type of types) {
			const roots = this.viewer.bundlesByElement.get(type);
			if (roots) for (const p of roots) {
				const root = els[p];
				if (root.group != "page") bundles.add(p);
			}
		}
		const js = new Set(to.scripts);
		const css = new Set(to.stylesheets);
		Array.from(bundles)
			.map(b => els[b])
			.sort(({ priority: a = 0 }, { priority: b = 0 }) => {
				if (a == b) return 0;
				else if (a > b) return 1;
				else return -1;
			}).forEach(el => {
				if (el.scripts) for (const url of el.scripts) js.add(url);
				if (el.stylesheets) for (const url of el.stylesheets) css.add(url);
			});
		to.scripts = Array.from(js);
		to.stylesheets = Array.from(css);
	}

	async import(res) {
		this.#state.doc ??= document.cloneNode();

		const types = new Set();
		if (res?.types) for (const type of res.types) types.add(type);
		if (res?.items) for (const item of res.items) types.add(item.type);

		let el;
		if (this.$element || !res?.item?.type) {
			el = { scripts: [], stylesheets: [] };
		} else {
			el = this.$element ??= { ...Pageboard.schemas.elements.definitions[res?.item.type] };
			if (window.parent.Pageboard.Editor) types.add('editor');
		}

		this.#install(types, el);

		if (el.name) this.viewer.setElement(el);
		else await load.bundle(this.#state, el);

		if (res) for (const [key, item] of Object.entries(res)) {
			this[`$${key}`] = item;
		}
	}

	render(data, el) {
		this.$status = data.status;
		this.$statusText = data.statusText;
		return fuse.render(this, data, el);
	}
}
