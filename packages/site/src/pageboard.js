export { default as debounce } from 'debounce';
import { default as fetchHelper } from './fetch';
import '@ungap/custom-elements';
import * as Class from './class';
import { Deferred } from 'class-deferred';
import './polyfills';
import 'window-page';
import Scope from './scope';
import './stages';


window.Deferred = Deferred;

for (const key in Class) {
	Object.defineProperty(Page.constructor.prototype, key, {
		value: Class[key]
	});
}

Page.constructor.prototype.fetch = fetchHelper;

Page.route(async state => {
	let data = state.data;
	if (!Object.keys(data).length) {
		state.data = data = await fetchHelper('get', '/.api/page', {
			url: state.pathname.replace(/\.\w+$/, ''),
			nested: window.parent != window ? 1 : undefined
		});
	}

	const scope = Scope.init(state);
	await scope.import(data);
	state.doc ??= document.cloneNode();
	scope.$page = data.item;
	const node = scope.render(data);
	if (!node || node.nodeName != "BODY") {
		throw new Error("page render should return a body element");
	}
	state.doc = node.ownerDocument;
	await scope.bundles(data);
	Object.assign(state.scope, scope);
});

Page.ready(state => {
	Scope.init(state);
});
