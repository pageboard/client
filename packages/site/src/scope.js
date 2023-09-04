import Viewer from '@pageboard/pagecut/src/viewer.js';
import * as fuse from './fuse';
import * as load from './load';

class OnDemandViewer extends Viewer {
	#bundles = {};

	element(type) {
		const el = super.element(type);
		if (!el.$installed) {
			fuse.install(el, this.scope);
		}
		return el;
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
		if (!scope) scope = state.referrer?.scope;

		if (!scope) scope = new Scope(state, {
			$filters: {},
			$elements: elts
		});
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
		if (!this.#view) this.#view = new OnDemandViewer({
			elements: this.$elements,
			document: this.$doc,
			scope: this
		});
		return this.#view;
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

	install() {
		this.#state.doc ??= document.cloneNode();
	}

	async import(res = {}) {
		await load.schemas(this, res.metas);
		if (res.item && !this.$element) {
			this.$element = this.$elements[res.item.type];
		}
		this.install();
		if (res.hrefs) {
			Object.assign(this.$hrefs, res.hrefs);
		}
		for (const k of ["grants", "links", "site", "locks", "granted", "commons", "meta", "status", "statusText", "item", "items", "count", "offset", "limit", "lang"]) {
			if (res[k] !== undefined) this[`$${k}`] = res[k];
		}
	}

	bundles(res) {
		return load.bundles(this.#state, res.metas);
	}

	render(data, el) {
		this.$status = data.status;
		this.$statusText = data.statusText;
		return fuse.render(this, data, el);
	}
}
