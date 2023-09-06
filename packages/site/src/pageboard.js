import { default as debounce } from 'debounce';
import { default as fetchHelper } from './fetch';
import '@ungap/custom-elements';
import * as Class from './class';
import { Deferred } from 'class-deferred';
import './polyfills';
import 'window-page';
import Scope from './scope';
import './stages';


window.Deferred = Deferred;


export const elements = window.Pageboard?.elements ?? {};

for (const key in Class) {
	Object.defineProperty(Page.constructor.prototype, key, {
		value: Class[key]
	});
}

Page.constructor.prototype.dispatch = function (target, name) {
	target.dispatchEvent(new CustomEvent(name, {
		bubbles: true,
		cancelable: true
	}));
};

Page.constructor.prototype.reveal = function (node) {
	const p = node.reveal(this)?.catch(() => {});
	if (!p) return;
	this.scope.reveals ??= Promise.resolve();
	this.scope.reveals = this.scope.reveals.then(() => p);
};

Page.constructor.prototype.fetch = fetchHelper;

Page.constructor.prototype.debounce = function (fn, to) {
	const db = debounce((...args) => {
		fn(...args);
	}, to);
	this.chain('close', db.clear);
	return db;
};

Page.route(async state => {
	const { data } = state;
	const nested = window.parent != window ? 1 : undefined;
	const lang = !nested ? state.query.lang : undefined;
	if (data.page == null) {
		data.page = await fetchHelper('get', '/.api/page', {
			url: state.pathname,
			lang,
			nested
		});
		if (!data.page.item) data.page.item = {
			type: 'error',
			data: data.page
		};
	}
	const { page } = data;

	const scope = Scope.init(state);
	scope.$lang = page.status != 400 && lang || page.site?.languages?.[0];
	await scope.import(page);
	scope.$page = page.item;
	const node = await scope.render(page);
	if (!node || node.nodeName != "BODY") {
		throw new Error("page render should return a body element");
	}
	state.doc = node.ownerDocument;
	// cleanup - in a future version we will have named fetches
	delete state.scope.$item;
	delete state.scope.$items;
	delete state.scope.$count;
	delete state.scope.$limit;
	delete state.scope.$offset;
});

Page.ready(state => {
	Scope.init(state);
	state.vars = {};
	if (state.query.lang == state.scope.$lang) state.vars.lang = true;
	state.ivars = new Set();
});
