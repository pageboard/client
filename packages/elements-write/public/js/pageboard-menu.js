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
	for (var i=0; i < main.elements.length; i++) {
		var el = main.elements[i];
		var nodeType = main.view.state.schema.nodes['root_' + el.name];
		if (!nodeType) continue;
		if (!el.icon) continue;

		items.push(new Pagecut.Menubar.Menu.MenuItem({
			title: el.name,
			onDeselected: 'disable',
			icon: el.icon,
			run: function(state, dispatch, view) {
				// TODO manage inline node insertion (and wrapping, but the problem is similar
				// with blocks). Use Marks ?
				// win.Pagecut.Commands.wrapIn(schema.nodes['blockquote'])(state, dispatch);
				var block = {
					id: - Date.now(),
					type: this.name,
					// TODO populate with current selection when possible
					content: {content: 'placeholder'}
				};
				main.modules.id.set(block);
				var dom = main.render(block, true);
				var frag = main.parse(dom);
				dispatch(state.tr.replaceSelectionWith(frag.content[0]));
			}.bind({name: el.name}),
			select: function(state) {
				return canInsert(state, nodeType);
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

})(window.Pageboard, window.Pagecut);

