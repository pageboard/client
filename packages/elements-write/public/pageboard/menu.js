(function(Pageboard, Pagecut) {

Pageboard.setupMenu = function(selector, editor) {
	var menu = new Pagecut.Menubar({
		place: document.querySelector(selector),
		items: getMenuItems(editor)
	});
	menu.update(editor.view);
	return menu;
};

function getItem(editor, el, nodeType) {
	return {
		title: el.name,
		onDeselected: 'disable',
		icon: el.icon,
		run: function(state, dispatch, view) {
			// TODO give a way to remove marks of current selected root node(s)
			var block = {
				id: - Date.now(),
				type: el.name
			};
			editor.modules.id.set(block);
			editor.replace(state.tr.selection, block);
		},
		select: function(state) {
			if (el.inline) {
				return canMark(state, nodeType);
			} else {
				return canInsert(state, nodeType);
			}
		},
		active: function(state) {
			if (!el.inline) {
				var parents = editor.selectionParents(state.tr.selection);
				var parent = parents[parents.length - 1];
				return parent && parent.block.type == el.name;
			} else {
				return markActive(state, nodeType);
			}
		}
	};
}

function getMenuItems(editor) {
	var singles = [];
	var dropdowns = [];
	var items = [singles, dropdowns];
	var menuGroups = {};
	var groups = [];
	var schema = editor.view.state.schema;

	var group, item;
	for (var i=0; i < editor.elements.length; i++) {
		var el = editor.elements[i];
		var nodeType = schema.nodes[el.name] || schema.marks[el.name];
		if (!nodeType || (!el.menu && !el.icon)) continue;
		item = new Pagecut.Menubar.Menu.MenuItem(getItem(editor, el, nodeType));
		if (el.menu) {
			group = menuGroups[el.menu]
			if (!group) {
				group = menuGroups[el.menu] = [];
				group.menu = el.menu;
				groups.push(group);
			}
			group.push(item);
		} else if (el.icon) {
			singles.push(item);
		}
	}

	for (var i=0; i < groups.length; i++) {
		dropdowns.push(new Pagecut.Menubar.Menu.Dropdown(groups[i], {
			label: groups[i].menu,
			title: "my title",
			class: "myclass",
			css: "mycss"
		}));
	}

	return items;
}

function canMark(state, nodeType) {
	var can = state.doc.contentMatchAt(0).allowsMark(nodeType);
	var sel = state.tr.selection;
	state.doc.nodesBetween(sel.from, sel.to, function(node) {
		if (can) return false;
		can = node.isTextblock && node.contentMatchAt(0).allowsMark(nodeType);
	});
	return can;
}

function canInsert(state, nodeType, attrs) {
	var $from = state.selection.$from;
	for (var d = $from.depth; d >= 0; d--) {
		var index = $from.index(d);
		if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) {
			return true;
		}
	}
	return false;
}

function markActive(state, type) {
	var sel = state.selection;
	if (sel.empty) {
		return type.isInSet(state.storedMarks || sel.$from.marks());
	}	else {
		return state.doc.rangeHasMark(sel.from, sel.to, type);
	}
}

})(window.Pageboard, window.Pagecut);

