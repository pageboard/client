import Viewer from '@pageboard/pagecut/src/viewer.js';
import * as fuse from './fuse';
import * as load from './load';

const baseElements = {
	error: {
		scripts: [],
		stylesheets: [],
		html: `<html>
		<head>
			<title>[$status|or:500] [$statusText|or:Error]</title>
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<meta name="robots" content="noindex">
			<meta http-equiv="Status" content="[$status|or:500] [$statusText|or:Error]">
		</head>
		<body>
			<h2>[message]</h2>
			<p><code>[stack]</code></p>
		</body></html>`
	}
};

export default class Scope {
	#state;
	#view;

	static init(state) {
		const elts = Pageboard.elements ??= {};
		Object.assign(elts, baseElements);

		let { scope } = state;

		if (!scope) scope = new Scope(state, {
			$filters: {},
			$elements: elts
		});
		else {
			scope.#state = state;
			scope = scope.copy();
		}
		state.scope = scope;
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
		return this.#state.referrer.pathname ?? this.$pathname;
	}
	get $doc() {
		return this.#state.doc;
	}
	set $doc(v) {
		// ignore it
	}
	get $view() {
		if (!this.#view) this.#view = new Viewer({
			elements: this.$elements,
			document: this.$doc
		});
		return this.#view;
	}
	copy(extra) {
		const scope = new Scope(this.#state, this);
		scope.#view = this.#view;
		if (extra) Object.assign(scope, extra);
		return scope;
	}

	install() {
		this.#state.doc ??= document.cloneNode();
		const elts = this.$elements;
		for (const name of Object.keys(elts)) {
			const el = elts[name];
			if (!el.name) el.name = name;
			fuse.install(el, this);
		}
	}

	async import(res = {}) {
		await load.schemas(this, res.metas);
		if (res.item && !this.$element) {
			this.$element = this.$elements[res.item.type];
		}
		this.install();
		if (res.hrefs) {
			if (!this.$hrefs) this.$hrefs = {};
			Object.assign(this.$hrefs, res.hrefs);
		}
		for (const k of ["grants", "links", "site", "locked", "granted", "commons", "meta", "status", "statusText", "item", "items"]) {
			if (res[k] !== undefined) this[`$${k}`] = res[k];
		}
	}

	async bundles(res) {
		await load.bundles(this.#state, res.metas);
	}

	render(data, el) {
		this.$status = data.status;
		this.$statusText = data.statusText;
		return fuse.render(this, data, el);
	}
}
