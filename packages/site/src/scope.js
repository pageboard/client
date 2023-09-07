import Viewer from '@pageboard/pagecut/src/viewer.js';
import BlocksView from '@pageboard/pagecut/src/blocks-view.js';
import * as fuse from './fuse';
import * as load from './load';


class CustomViewer extends Viewer {
	#bundleMap = new Map();
	#bundleState = new Map();

	constructor(opts) {
		super(opts);
		const map = this.#bundleMap;
		for (const p of Object.values(this.elements)) {
			if (!p.bundle) continue;
			for (const n of p.bundle) {
				let list = map.get(n);
				if (!list) map.set(n, list = new Set());
				list.add(p.name);
			}
		}
	}

	element(type) {
		const el = super.element(type);
		if (el) fuse.install(el, this.scope);
		return el;
	}

	bundlesOf(type) {
		return this.#bundleMap.get(type);
	}

	async waitBundles() {
		await Promise.allSettled(Object.values(this.#bundleState));
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
			scope.#view = new CustomViewer({
				elements: elts,
				document: this.$doc,
				scope: this
			});
			scope.#view.blocks = new BlocksView(scope.#view);
		}
		else {
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
	set $elements(els) {

	}
	var(name) {
		this.#state.vars[name] = true;
	}
	copy(extra) {
		const scope = new Scope(this.#state, this);
		scope.#view = this.#view;
		scope.#lang = this.#lang;
		if (extra) Object.assign(scope, extra);
		return scope;
	}

	async #install(type, to) {
		const roots = this.$view.bundlesOf(type);
		if (!roots) return;
		for (const p of roots) {
			const root = this.$elements[p];
			if (root.group == "page") continue;

			const { scripts, stylesheets } = root;
			for (const url of scripts) to.scripts.add(url);
			for (const url of stylesheets) to.stylesheets.add(url);
		}
	}

	async import(res) {
		this.#state.doc ??= document.cloneNode();
		let el;
		if (this.$element || !res?.item?.type) {
			el = { scripts: [], stylesheets: [] };
		} else {
			el = this.$element ??= { ...Pageboard.elements[res?.item.type] };
		}
		el.scripts = new Set(el.scripts);
		el.stylesheets = new Set(el.stylesheets);
		if (res?.bundles) for (const bundle of res.bundles) {
			this.#install(bundle, el);
		}
		if (res?.items) for (const item of res.items) {
			this.#install(item.type, el);
		}
		if (el.group == "page" && window.parent.Pageboard.Editor) {
			this.#install('editor', el);
		}
		if (el.name) this.$view.setElement(el);
		else await load.bundle(this.#state, el);
		if (res?.hrefs) {
			Object.assign(this.$hrefs, res.hrefs);
		}
		if (res) for (const k of ["grants", "links", "site", "locks", "granted", "commons", "meta", "status", "statusText", "item", "items", "count", "offset", "limit", "lang"]) {
			if (res[k] !== undefined) this[`$${k}`] = res[k];
		}
	}

	renderSync(data, el) {
		this.$status = data.status;
		this.$statusText = data.statusText;
		return fuse.render(this, data, el);
	}

	async render(data, el) {
		const frag = this.renderSync(data, el);
		await this.$view.waitBundles();
		return frag;
	}
}
