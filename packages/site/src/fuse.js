import {
	Matchdom,
	StringPlugin,
	OpsPlugin,
	ArrayPlugin,
	NumPlugin,
	DatePlugin,
	RepeatPlugin,
	DomPlugin,
	UrlPlugin,
	JsonPlugin
} from 'matchdom';

import str2dom from '@pageboard/pagecut/src/str2dom.js';

export { str2dom };

import * as CustomPlugin from './plugin';

const mSym = Matchdom.Symbols;
const reFuse = new RegExp(`\\${mSym.open}[^\\${mSym.open}\\${mSym.close}]+\\${mSym.close}`);

const dataMd = new Matchdom(
	StringPlugin,
	OpsPlugin,
	ArrayPlugin,
	NumPlugin,
	DatePlugin,
	DomPlugin,
	UrlPlugin,
	CustomPlugin
);

const templateMd = dataMd.copy().extend(RepeatPlugin).extend({
	types: {
		query(ctx, obj) {
			if (typeof obj == "string" && reFuse.test(obj)) return obj;
			else return UrlPlugin.types.query(ctx, obj);
		}
	}
});

const objectMd = templateMd.copy().extend(JsonPlugin);

Document.prototype.dom = function() {
	return str2dom(Array.prototype.join.call(arguments, '\n'), {
		doc: this
	});
};

Document.prototype.fragment = function(...args) {
	const node = this.dom(...args);
	if (node.nodeType == Document.DOCUMENT_FRAGMENT_NODE) return node;
	const frag = this.createDocumentFragment();
	frag.appendChild(node);
	return frag;
};

Document.prototype.fuse = XMLDocument.prototype.fuse = function(obj, scope) {
	this.documentElement.fuse(obj, scope);
	return this;
};

Node.prototype.dom = function() {
	return str2dom(Array.prototype.join.call(arguments, '\n'), {
		doc: this.ownerDocument,
		ns: this.namespaceURI
	});
};

const fuse = (obj, data, scope) => {
	const md = (scope.$filters || scope.$hooks || scope.$formats) ? new Matchdom(templateMd, {
		filters: scope.$filters,
		hooks: scope.$hooks,
		formats: scope.$formats
	}) : templateMd;
	return md.merge(obj, data, scope);
};

Object.getPrototypeOf(Page.constructor).prototype.fuse = function (data, scope) {
	if (!scope) console.warn("Missing scope param");
	this.pathname = objectMd.merge(this.pathname, data, scope);
	this.query = objectMd.merge(this.query, data, scope);
	return this;
};

Node.prototype.fuse = function (data, scope) {
	// eslint-disable-next-line no-console
	if (!scope) console.warn("Missing scope param");
	return fuse(this, data, scope);
};

String.prototype.fuse = function(data, scope) {
	if (data == null && scope == null) return reFuse.test(this.toString());
	return fuse(this.toString(), data, scope);
};


export function render(scope, data, el) {
	if (!data) data = {};

	const block = data.item ?? data;
	// fixme
	// api should always reply with some kind of block,
	// knowing that merge(block.data) and scope contains other keys of the block,
	// prefixed with $
	const blocks = {};
	if (data.items) {
		for (const child of data.items) {
			blocks[child.id] = child;
			// this case should actually be res.item.children (like blocks.search api)
			// but page.get api returns res.item/res.items and we can't change it in a compatible way.
			if (child.children && !data.item) {
				for (const item of child.children) {
					blocks[item.id] = item;
				}
			}
		}
	}
	const frag = scope.viewer.from(block, blocks, {
		element: el,
		scope,
		strip: !scope.$write
	});
	return frag;
}


