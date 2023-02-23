import * as State from "prosemirror-state";
import * as Transform from "prosemirror-transform";
import * as View from "prosemirror-view";
import * as Model from "prosemirror-model";
import { keymap } from "prosemirror-keymap";
import * as Commands from "prosemirror-commands";
import * as Setup from "prosemirror-example-setup";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import * as History from "prosemirror-history";
import OrderedMap from "orderedmap";

import * as baseSchema from "prosemirror-schema-basic";

import IdPlugin from "./id-plugin";
import FocusPlugin from "./focus-plugin";
import KeymapPlugin from "./keymap-plugin";
import InputPlugin from "./input-plugin";

import Utils from "./utils";
import DefineSpecs from "./specs";
import BlocksEdit from "./blocks-edit";
import SetDocAttr from "./SetDocAttr";
import EditorViewer from "./viewer";
import { MenuItem, MenuBar } from "./menubar";

const Viewer = window.Pagecut?.Viewer ?? EditorViewer;
Viewer.Blocks = BlocksEdit;

Transform.Transform.prototype.docAttr = function(key, value) {
	return this.step(new SetDocAttr(key, value));
};

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false;

class Editor extends View.EditorView {
	#utils;
	static defaults = {
		nodes: OrderedMap.from(baseSchema.nodes),
		marks: OrderedMap.from(baseSchema.marks),
		mapKeys: {
			"Mod-z": History.undo,
			"Shift-Mod-z": History.redo,
			"Mod-y": !mac && History.redo || null
		},
		elements: {
			_: {
				priority: -Infinity,
				title: "Empty",
				group: "block",
				inplace: true,
				draggable: false,
				render: function(block, scope) {
					return scope.$doc.createElement('pagecut-placeholder');
				}
			}
		}
	};

	static filteredSerializer(spec, obj) {
		if (typeof obj == "function") obj = {filter: obj};
		const ser = Model.DOMSerializer.fromSchema(new Model.Schema(spec));
		function replaceOutputSpec(fun) {
			return function(node) {
				let out = fun(node);
				const mod = obj.filter(node, out);
				if (mod !== undefined) out = mod;
				return out;
			};
		}
		for (const name of Object.keys(ser.nodes)) {
			if (spec.nodes.get(name).typeName != null) {
				ser.nodes[name] = replaceOutputSpec(ser.nodes[name]);
			}
		}
		for (const name of Object.keys(ser.marks)) {
			if (spec.marks.get(name).typeName != null) {
				ser.marks[name] = replaceOutputSpec(ser.marks[name]);
			}
		}
		return ser;
	}

	static configure(viewer, { topNode, jsonContent, content, plugins = [] }) {
		const elements = viewer.elements;
		const spec = {
			topNode,
			nodes: Editor.defaults.nodes.remove(topNode ? 'doc' : null),
			marks: Editor.defaults.marks
		};

		const nodeViews = {};
		const elemsList = Object.values(elements).sort((a, b) => {
			return (b.priority || 0) - (a.priority || 0);
		});
		for (const el of elemsList) {
			DefineSpecs(viewer, el, spec, nodeViews);
		}
		const schema = new Model.Schema(spec);
		const domParser = Model.DOMParser.fromSchema(schema);

		const doc =
			jsonContent && schema.nodeFromJSON(jsonContent)
			|| content && domParser.parse(content);

		const clipboardSerializer = this.filteredSerializer(spec, (node, out) => {
			if (node.type.name == "_") return "";
			const attrs = out[1];
			if (node.attrs.data) attrs['block-data'] = node.attrs.data;
			if (node.attrs.expr) attrs['block-expr'] = node.attrs.expr;
			if (node.attrs.lock) attrs['block-lock'] = node.attrs.lock;
			if (node.attrs.standalone) attrs['block-standalone'] = 'true';
			delete attrs['block-focused'];
		});
		clipboardSerializer.serializeFragment = (function(meth) {
			return function(frag, opts, top) {
				const tmpl = top?.nodeName == "TEMPLATE";
				const ret = meth.call(this, frag, opts, tmpl ? top.content : top);
				if (tmpl) return top;
				else return ret;
			};
		})(clipboardSerializer.serializeFragment);

		const clipboardParser = Model.DOMParser.fromSchema(schema);

		const viewSerializer = this.filteredSerializer(spec, (node, out) => {
			if (node.type.name == "_") return "";
			const obj = out[1];
			if (typeof obj != "object") return;
			// delete obj['block-root_id'];
		});

		const pluginKeys = {};
		plugins = [
			IdPlugin,
			KeymapPlugin,
			FocusPlugin,
			InputPlugin,
			Setup.buildInputRules(schema),
			keymap(Editor.defaults.mapKeys),
			keymap(Commands.baseKeymap),
			History.history({
				preserveItems: true // or else cancel does not keep selected node
			}),
			gapCursor(),
			dropCursor({
				width: 2,
				class: 'ProseMirror-dropcursor'
			}),
			...plugins
		].map(plugin => {
			if (plugin instanceof State.Plugin) return plugin;
			if (plugin.prototype) plugin = new plugin();
			if (plugin.update || plugin.destroy ) {
				plugin = {
					view: function (editor) {
						this.editor = editor;
						return this;
					}.bind(plugin)
				};
			}
			if (typeof plugin?.key == "string") {
				plugin.key = pluginKeys[plugin.key] = new State.PluginKey(plugin.key);
			}
			return new State.Plugin(plugin);
		});

		return {
			attributes: {
				spellcheck: 'false'
			},
			state: State.EditorState.create({
				schema, plugins, doc
			}),
			domParser,
			clipboardParser,
			clipboardSerializer,
			viewSerializer,
			nodeViews,
			viewer,
			dispatchTransaction: function (tr) {
				this.updateState(this.state.apply(tr));
			}
		};
	}

	constructor(opts) {
		const elts = opts.elements;
		for (const [name, elt] of Object.entries(Editor.defaults.elements)) {
			elts[name] = { ...elt, ...elts[name] };
		}
		const viewer = new Viewer(opts);
		super({
			mount: typeof opts.place == "string" ?
				document.querySelector(opts.place) :
				opts.place ?? opts.content
		}, Editor.configure(viewer, opts));

		if (opts.scope) this.scope = opts.scope;
		if (opts.explicit) this.explicit = true;
		this.cssChecked = true;
		this.dom.addEventListener('click', this, true);
		this.dom.addEventListener('submit', this, true);
		this.dom.addEventListener('invalid', this, true);
	}
	get utils() {
		if (!this.#utils) this.#utils = new Utils(this);
		return this.#utils;
	}
	get blocks() {
		if (!this.elements) {
			// this is a trick to do post-super initializing
			const viewer = this.props.viewer;
			viewer.blocks.view = this;
			Object.defineProperty(this, 'blocks', {
				writable: true,
				value: viewer.blocks
			});
			Object.assign(this, viewer);
		}
		return this.blocks;
	}
	parseFromClipboard(html, $pos) {
		// eslint-disable-next-line no-underscore-dangle
		return View.__parseFromClipboard(this, null, html, null, $pos);
	}
	to(blocks) {
		return this.blocks.to(blocks);
	}
	getPlugin(key) {
		return new State.PluginKey(key).get(this.state);
	}
	handleEvent(e) {
		super.handleEvent(e);
		if (this.closed) return;
		if (e.type == "submit") {
			e.preventDefault();
			e.stopImmediatePropagation();
		} else if (e.type == "click") {
			const editor = this;
			if (editor.closed) return;
			const node = e.target.closest('a[href],input,button,textarea,label[for]');
			if (!node) return;
			e.preventDefault();
			const isInput = node.matches('input,textarea,select');
			if (!isInput) return;
			const parent = node.closest('[block-type]');
			const sel = editor.utils.select(parent);
			if (sel) {
				editor.focus();
				editor.dispatch(editor.state.tr.setSelection(sel));
			}
		}
	}
	close() {
		this.closed = true;
		this.dom.removeEventListener('click', this, true);
		this.dom.removeEventListener('submit', this, true);
		this.dom.removeEventListener('invalid', this, true);
	}
}
for (const name of ['render', 'element', 'from']) {
	Object.defineProperty(
		Editor.prototype,
		name,
		Object.getOwnPropertyDescriptor(Viewer.prototype, name)
	);
}

export {
	Editor, View, Model, State, Transform, Commands, keymap, Viewer, MenuItem, MenuBar
};

