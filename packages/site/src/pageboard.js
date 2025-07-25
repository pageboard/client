import { default as debounce } from 'debounce';
import { default as fetchHelper } from './fetch';
import * as Class from './class';
import { js as loadScript } from './load';
import './utils';
import 'window-page';
import Scope from './scope';
import './stages';

const Pageboard = window.Pageboard ??= {};

(async () => {
	const polyfills = [];
	Object.entries(Pageboard.polyfills ?? {}).forEach(([name, ok]) => {
		if (ok) return;
		const { lang } = document.documentElement;
		if (name.endsWith('*')) name = name.slice(0, -1) + lang;
		polyfills.push(name);
	});
	if (polyfills.length) {
		const url = new URL(
			`/@file/polyfill.js`,
			document.location
		);
		url.searchParams.set('version', Pageboard.polyfills.version);
		url.searchParams.set('features', polyfills.join('!'));
		await loadScript(url.pathname + url.search, document, -1000);
	}
	if (document.documentElement.dataset.prerender == "true") {
		for (const node of document.head.querySelectorAll('script[data-src]')) {
			node.async = false; // firefox
			node.src = node.dataset.src;
			node.removeAttribute('data-src');
		}
	}
})();


const PageProto = Page.constructor.prototype;

for (const key in Class) {
	if (!Object.hasOwn(PageProto, key)) Object.defineProperty(PageProto, key, {
		value: Class[key]
	});
}

let Element;
if (!Object.hasOwn(PageProto, 'Element')) Object.defineProperty(PageProto, 'Element', {
	get() {
		Element ??= Class.create(HTMLElement);
		return Element;
	}
});

PageProto.dispatch = function (target, name) {
	target.dispatchEvent(new CustomEvent(name, {
		bubbles: true,
		cancelable: true
	}));
};

PageProto.reveal = function (node) {
	this.scope.reveals ??= [];
	const p = node.reveal(this);
	if (p) this.scope.reveals.push(p.catch(err => err));
};

PageProto.revealAll = function () {
	if (!this.scope.observer) return;
	const list = this.scope.observer.unobserveAll();
	this.scope.observer.disconnect();
	delete this.scope.observer;
	for (const node of list) this.reveal(node);
};

PageProto.fetch = fetchHelper;

PageProto.debounce = function (fn, to) {
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
		data.response = await fetchHelper('get', '/@api/page/find', {
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
});
