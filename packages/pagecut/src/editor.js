const State = require("prosemirror-state");
const Transform = require("prosemirror-transform");
const View = require("prosemirror-view");
const Model = require("prosemirror-model");
const { keymap } = require("prosemirror-keymap");
const Commands = require("prosemirror-commands");
const Setup = require("prosemirror-example-setup");
const { dropCursor } = require("prosemirror-dropcursor");
const { gapCursor } = require("prosemirror-gapcursor");
const History = require("prosemirror-history");
const OrderedMap = require("orderedmap");

const baseSchema = require("prosemirror-schema-basic");

const IdPlugin = require("./id-plugin");
const FocusPlugin = require("./focus-plugin");
const KeymapPlugin = require("./keymap-plugin");
const InputPlugin = require("./input-plugin");

const Utils = require("./utils");
const Specs = require("./specs");
const BlocksEdit = require('./blocks-edit');
const SetDocAttr = require("./SetDocAttr");
const Viewer = global.Pagecut?.Viewer ?? require("./viewer");
Viewer.Blocks = BlocksEdit;

Transform.Transform.prototype.docAttr = function(key, value) {
	return this.step(new SetDocAttr(key, value));
};

const mac = typeof navigator != "undefined" ? /Mac/.test(navigator.platform) : false;

class Editor extends View.EditorView {
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
	}

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
		Object.keys(ser.nodes).forEach(function(name) {
			if (spec.nodes.get(name).typeName == null) return;
			ser.nodes[name] = replaceOutputSpec(ser.nodes[name]);
		});
		Object.keys(ser.marks).forEach(function(name) {
			if (spec.marks.get(name).typeName == null) return;
			ser.marks[name] = replaceOutputSpec(ser.marks[name]);
		});
		return ser;
	}

	static configure(viewer, { topNode, jsonContent, content, plugins }) {
		const elements = viewer.elements;
		const spec = {
			topNode,
			nodes: Editor.defaults.nodes.remove(topNode ? 'doc' : null),
			marks: Editor.defaults.marks
		};

		const nodeViews = {};
		const elemsList = Object.values(elements).sort(function(a, b) {
			return (a.priority || 0) - (b.priority || 0);
		});
		for (let i = elemsList.length - 1; i >= 0; i--) {
			Specs.define(viewer, elemsList[i], spec, nodeViews);
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

		const viewSerializer = this.filteredSerializer(spec, function(node, out) {
			if (node.type.name == "_") return "";
			const obj = out[1];
			if (typeof obj != "object") return;
			// delete obj['block-root_id'];
		});

		const pluginKeys = {};
		plugins = [IdPlugin,
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
			})
		].concat(plugins).map(plugin => {
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
			elts[name] = Object.assign({}, elt, elts[name]);
		}
		const viewer = new Viewer(opts);
		super({
			mount: typeof opts.place == "string" ?
				document.querySelector(opts.place) :
				opts.place
		}, Editor.configure(viewer, opts));

		if (opts.scope) this.scope = opts.scope;
		if (opts.explicit) this.explicit = true;
		this.cssChecked = true;
	}
	get blocks() {
		if (!this.elements) {
			// this is a trick to do post-super initializing
			this.utils = new Utils(this);
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
		if (typeof html != "string") {
			html = this.utils.serializeHTML(html);
		}
		return View.__parseFromClipboard(this, null, html, null, $pos);
	}
	to(blocks) {
		return this.blocks.to(blocks);
	}
	getPlugin(key) {
		return new State.PluginKey(key).get(this.state);
	}
}
['render', 'element', 'from'].forEach(name => {
	Object.defineProperty(
		Editor.prototype,
		name,
		Object.getOwnPropertyDescriptor(Viewer.prototype, name)
	);
});

module.exports = {
	Editor, View, Model, State, Transform, Commands, keymap, Viewer
};

