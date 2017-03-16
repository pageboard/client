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
	var item = {
		title: el.title,
		onDeselected: 'disable',
		icon: el.icon,
		run: function(state, dispatch, view) {
			// TODO give a way to remove marks of current selected root node(s)
			var block = {
				type: el.name
			};
			var sel = state.tr.selection;
			sel = editor.select(sel) || sel;
			editor.insert(block, sel);
		},
		select: function(state) {
			if (el.inline) {
				return editor.canMark(state, nodeType);
			} else {
				return editor.canInsert(state, nodeType);
			}
		},
		active: function(state) {
			if (!el.inline) {
				var parents = editor.selectionParents(state.tr.selection);
				if (!parents.length) return false;
				var parent = parents[0];
				return parent.root.node.type.name == el.name;
			} else {
				return editor.markActive(state, nodeType);
			}
		}
	};
	if (el.icon) item.icon = el.icon;
	else if (el.title) item.label = el.title;
	return item;
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
			label: groups[i].menu
		}));
	}

	return items;
}

})(window.Pageboard, window.Pagecut);

