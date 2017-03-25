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
			var block = {
				type: el.name
			};
			var tr = state.tr;
			var sel = editor.selectTr(tr, tr.selection, true);

			if (el.inline && editor.markActive(state, nodeType)) {
				tr = tr.removeMark(sel.from, sel.to, nodeType);
			} else {
				tr = editor.insertTr(tr, block, sel);
			}
			if (tr) dispatch(tr);
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
				var parents = editor.selectionParents(state.tr);
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
	var groups = [{
		id: 'layout',
		title: 'Layout'
	}];
	var group, item;

	// initialize menuGroups cache
	for (var i = 0; i < groups.length; i++) {
		group = groups[i];
		menuGroups[group.id] = group;
	}

	var schema = editor.view.state.schema;
	for (var i=0; i < editor.elements.length; i++) {
		var el = editor.elements[i];
		var nodeType = schema.nodes[el.name] || schema.marks[el.name];
		if (!nodeType || (!el.menu && !el.icon)) continue;
		item = new Pagecut.Menubar.Menu.MenuItem(getItem(editor, el, nodeType));
		if (el.menu) {
			group = menuGroups[el.menu];
			if (!group) {
				// in case of unknown groups
				group = menuGroups[el.menu] = {title: el.menu};
				groups.push(group);
			}
			if (!group.items) group.items = [];
			group.items.push(item);
		} else if (el.icon) {
			singles.push(item);
		}
	}

	for (var i=0; i < groups.length; i++) {
		group = groups[i];
		dropdowns.push(new Pagecut.Menubar.Menu.Dropdown(group.items, {
			label: group.title,
			title: group.title
		}));
	}

	return items;
}

})(window.Pageboard, window.Pagecut);

