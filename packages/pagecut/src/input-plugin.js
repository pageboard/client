const State = require("prosemirror-state");
const Model = require("prosemirror-model");

module.exports = function(view, options) {
	return {
		props: new InputPlugin(view, options)
	};
};

function InputPlugin(view, options) {
	this.clipboardTextParser = this.clipboardTextParser.bind(this);
	this.transformPasted = this.transformPasted.bind(this);
	this.handlePaste = this.handlePaste.bind(this);

	this.view = view;
}

InputPlugin.prototype.handlePaste = function(view, e, slice) {
	// TODO find insert point using e.
};

InputPlugin.prototype.handleTextInput = function(view, from, to, text) {
	var tr = view.state.tr;
	// return true to disable default insertion
	var parents = view.utils.selectionParents(tr, {from: from, to: to});
	if (!parents.length) return true;
	var parent = parents[0];
	var root = parent.container || parent.root;
	if (tr.selection.node && tr.selection.node.isTextblock) {
		// change selection to be inside that node
		view.dispatch(
			tr.setSelection(
				State.Selection.near(tr.selection.$from)
			)
		);
		return false;
	}
	if (root && root.node && (root.node.isTextblock || root.node.type.name == "_") || parent.inline) {
		// it should be all right then
		return false;
	}
	return true;
};

InputPlugin.prototype.transformPasted = function(slice) {
	var view = this.view;
	var sParent;
	// TODO can't paste standalone from another site
	slice.content.descendants(function (node, pos, parent) {
		var focusable = node.type.defaultAttrs.focused === null;
		if (focusable) node.attrs.focused = null;
		var sa = node.attrs.standalone;
		if (sa) sParent = parent;
		else if (sParent && sParent == parent) sParent = null;
		var id = node.attrs.id;
		if (id) {
			var block = view.blocks.get(id);
			if (!block && !sa && !sParent) {
				// not a standalone or not a child of one
				delete node.attrs.id;
			}
			if (block && focusable) {
				delete block.focused;
			}
		}
	});
	return slice;
};

InputPlugin.prototype.clipboardTextParser = function(str, $pos) {
	if (str instanceof Model.Slice) {
		return str;
	}
	var type = $pos.parent && $pos.parent.type.name || '';
	var dom;
	if (type.startsWith('svg')) {
		dom = (new DOMParser()).parseFromString(str, "image/svg+xml");
	} else {
		dom = this.view.utils.parseHTML(str);
	}
	return this.view.someProp("clipboardParser").parseSlice(dom, {
		preserveWhitespace: true,
		context: $pos
	});
};

