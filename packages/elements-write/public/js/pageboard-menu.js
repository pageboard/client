(function(Pageboard, Pagecut) {

Pageboard.setupMenu = function(selector, editor) {
	var menu = new Pagecut.Menubar({
		place: document.querySelector(selector),
		items: getMenuItems(editor)
	});
	menu.update(editor.view);
	return menu;
};

function getMenuItems(main) {
	var items = [];
	var schema = main.view.state.schema;
	var win = main.view.root.defaultView;

	for (var i=0; i < main.elements.length; i++) {
		var el = main.elements[i];
		var nodeType = schema.nodes[el.name] || schema.marks[el.name];
		if (!nodeType) continue;
		if (!el.icon) continue;

		items.push(new Pagecut.Menubar.Menu.MenuItem({
			title: el.name,
			onDeselected: 'disable',
			icon: el.icon,
			run: function(state, dispatch, view) {
				var block = {
					id: - Date.now(),
					type: this.name
				};
				main.modules.id.set(block);

				if (el.inline) {
					// TODO select whole node to do that
					win.Pagecut.Commands.toggleMark(
						nodeType,
						{block_id: block.id}
					)(state, dispatch);
				} else {
					var node = main.parse(main.render(block, true)).content[0];
					dispatch(state.tr.replaceSelectionWith(node));
				}
			}.bind({name: el.name}),
			select: function(state) {
				if (el.inline) return true;
				return canInsert(state, nodeType);
			},
			active: function(state) {
				if (!el.inline) return true;
				return markActive(state, nodeType);
			}
		}));
	}
	return [items];
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

