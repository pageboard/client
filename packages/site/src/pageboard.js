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
Page.constructor.prototype.reveal = function (node) {
	const p = node.reveal(this);
	if (!p) return;
	this.scope.reveals ??= [];
	this.scope.reveals.push(p);
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
	let data = state.data;
	if (!Object.keys(data).length) {
		state.data = data = await fetchHelper('get', '/.api/page', {
			url: state.pathname.replace(/\.\w+$/, ''),
			nested: window.parent != window ? 1 : undefined
		});
		if (!data.item) data.item = {
			type: 'error',
			data
		};
	}

	const scope = Scope.init(state);
	await scope.import(data);
	scope.$page = data.item;
	const node = scope.render(data);
	if (!node || node.nodeName != "BODY") {
		throw new Error("page render should return a body element");
	}
	state.doc = node.ownerDocument;
	await scope.bundles(data);
	// cleanup
	delete state.scope.$item;
	delete state.scope.$items;
});

Page.ready(state => {
	Scope.init(state);
});
