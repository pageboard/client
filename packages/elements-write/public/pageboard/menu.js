(function(Pageboard, Pagecut) {

Pageboard.Controls.Menu = Menu;

function Menu(editor, selector) {
	this.editor = editor;
	this.menu = new Pagecut.Menubar({
		place: document.querySelector(selector),
		items: this.items()
	});
	this.update();
}

Menu.prototype.update = function() {
	// because updates are done by the editor
	var frag = document.createDocumentFragment();
	var needSep = false;
	var content = this.menu.items;
	for (var i = 0; i < content.length; i++) {
		var items = content[i];
		var added = false;
		for (var j = 0; j < items.length; j++) {
			var rendered = renderItem.call(items[j], this.editor);
			if (rendered) {
				if (!added && needSep) {
					frag.appendChild(separator());
				}
				frag.appendChild(rendered);
				added = true;
			}
		}
		if (added) {
			needSep = true;
		}
	}
	this.menu.place.textContent = ""
	this.menu.place.appendChild(document.adoptNode(frag));
};

function separator() {
	var div = document.createElement("div");
	div.className = "divider";
	return div;
}

Menu.prototype.item = function(el) {
	var editor = this.editor;
	var schema = editor.state.schema;
	var nodeType = schema.nodes[el.name] || schema.marks[el.name];
	if (!nodeType || (!el.menu && !el.icon)) return;

	var item = {
		element: el,
		onDeselected: 'disable',
		run: function(state, dispatch, view) {
			var block = {
				type: el.name
			};
			editor.modules.id.set(block);
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
				return parent.root && parent.root.node && parent.root.node.type.name == el.name;
			} else {
				return editor.markActive(state, nodeType);
			}
		}
	};
	return item;
};


function renderItem(view) {
	var disabled = false;
	var spec = this.spec;
	if (spec.select && !spec.select(view.state)) {
		if (spec.onDeselected == "disable") {
			disabled = true;
		} else {
			return null;
		}
	}
	var active = spec.active && !disabled && spec.active(view.state);

	var dom = document.createElement('a');
	dom.className = "item";

	var icon = spec.element.icon;
	if (icon) {
		// can be a string formatted as SVG, or an URL
		if (/<svg/i.test(icon)) {
			dom.insertAdjacentHTML('afterbegin', icon);
			dom.querySelector('svg').setAttribute('class', 'icon');
		} else if (icon.startsWith('<')) {
			dom.insertAdjacentHTML('afterbegin', icon);
		} else {
			dom.insertAdjacentHTML('afterbegin', `<img class="icon" src="${icon}" />`);
		}
	}
	dom.appendChild(document.createTextNode('\n' + translate(view, spec.element.title)));
	if (active) {
		dom.classList.add("active");
	}
	if (spec.element.description) {
		dom.setAttribute("title", translate(view, translate(spec.element.description)));
	}
	if (disabled) {
		dom.classList.add("disabled");
	} else {
		dom.addEventListener("mousedown", function (e) {
			e.preventDefault()
			spec.run(view.state, view.dispatch, view);
		});
	}
	return dom;
}

Menu.prototype.items = function() {
	var singles = [];
	var dropdowns = [];
	var items = [singles];
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


	for (var i=0; i < this.editor.elements.length; i++) {
		var el = this.editor.elements[i];
		var itemSpec = this.item(el);
		if (!itemSpec) continue;
		item = new Pagecut.Menubar.Menu.MenuItem(itemSpec);
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
		items.push(group.items);
		// dropdowns.push(new Pagecut.menubar.menu.dropdown(group.items, {
		// 	label: group.title,
		// 	title: group.title
		// }));
	}

	return items;
};

function translate(view, text) {
	return view._props.translate ? view._props.translate(text) : text;
}

})(window.Pageboard, window.Pagecut);

