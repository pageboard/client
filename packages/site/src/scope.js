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
			el = this.elements[el.name] = new CustomElement(el);
		}
		el.install(this.scope);
		return el;
	}

	setElement(el) {
		if (!el.name) throw new Error("Element must have a name");
		if (!(el instanceof CustomElement)) el = new CustomElement(el);
		el.install(this.scope);
		this.elements[el.name] = el;
		return el;
	}

	prepare() {
		for (const name in this.elements) this.element(name);
	}

	init() {
		const map = this.bundleMap = new Map();
		for (const [name, el] of Object.entries(this.elements)) {
			el.name = name;
			if (!el.bundle) continue;
			for (const n of el.bundle) {
				let list = map.get(n);
				if (!list) map.set(n, list = new Set());
				list.add(el.name);
			}
		}
	}

	bundlesOf(type) {
		return this.bundleMap.get(type);
	}
}

const baseElements = {
	error: {
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
	#view;
	#lang;

	static init(state) {
		const elts = Pageboard.elements ??= {};
		Object.assign(elts, baseElements);

		let { scope } = state;
		if (state.pathname == state.referrer?.pathname && !state.data.page && state.referrer.data.page) {
			state.data.page = state.referrer.data.page;
		}

		if (!scope) {
			scope = new Scope(state, {
				$filters: {}
			});
			scope.$elements = elts;
		} else {
			scope = scope.copy();
			scope.#state = state;
		}
		state.scope = scope;
		return scope;
	}

	constructor(state, obj = {}) {
		this.#state = state;
		Object.assign(this, obj);
	}
	get $lang() {
		return this.#lang;
	}
	set $lang(lang) {
		this.#lang = lang;
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
	set $doc(v) {
		// ignore it
	}
	get $view() {
		return this.#view;
	}
	get $elements() {
		return this.#view.elements;
	}
	set $elements(elts) {
		if (elts == this.#view?.elements) return;
		const v = this.#view = new CustomViewer({
			elements: elts,
			document: this.$doc,
			scope: this
		});
		v.blocks = new BlocksView(v);
	}

	var(name) {
		this.#state.vars[name] = true;
	}
	copy(extra) {
		const scope = new Scope(this.#state, this);
		scope.#view = this.#view;
		scope.#view.scope = this;
		scope.#lang = this.#lang;
		if (extra) Object.assign(scope, extra);
		return scope;
	}

	async #install(types, to) {
		const bundles = new Set();
		const els = this.$elements;
		for (const type of types) {
			const roots = this.$view.bundlesOf(type);
			if (!roots) continue;
			for (const p of roots) {
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
			el = this.$element ??= { ...Pageboard.elements[res?.item.type] };
			if (window.parent.Pageboard.Editor) types.add('editor');
		}

		this.#install(types, el);

		if (el.name) this.$view.setElement(el);
		else await load.bundle(this.#state, el);

		if (res?.hrefs) {
			Object.assign(this.$hrefs, res.hrefs);
		}
		if (res) for (const k of ["grants", "links", "site", "locks", "granted", "commons", "meta", "status", "statusText", "item", "items", "count", "offset", "limit", "lang"]) {
			if (res[k] !== undefined) this[`$${k}`] = res[k];
		}
	}

	render(data, el) {
		this.$status = data.status;
		this.$statusText = data.statusText;
		return fuse.render(this, data, el);
	}
}
