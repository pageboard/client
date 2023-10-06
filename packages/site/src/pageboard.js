import { default as debounce } from 'debounce';
import { default as fetchHelper } from './fetch';
import '@ungap/custom-elements';
import * as Class from './class';
import './polyfills';
import 'window-page';
import Scope from './scope';
import './stages';
export { Deferred } from 'class-deferred';


export const Pageboard = window.Pageboard ?? {};
export const elements = Pageboard.elements ?? {};

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
	if (data.response == null) {
		data.response = await fetchHelper('get', '/.api/page', {
			url: state.pathname, nested
		});
		if (!data.response.item) data.response.item = {
			type: 'error',
			data: data.response
		};
	}
	const { response } = data;

	const scope = Scope.init(state);
	await scope.import(response);
	scope.$page = response.item;
	const node = scope.render(response);
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
	state.scope.$lang ??= document.documentElement.lang;
	state.vars = {};
	state.ivars = new Set();
});
