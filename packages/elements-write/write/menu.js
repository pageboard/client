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

Menu.prototype.update = function(parents, sel) {
	// because updates are done by the editor
	this.selection = sel || this.editor.state.tr.selection;
	var frag = document.createDocumentFragment();
	var content = this.menu.items;
	for (var i = 0; i < content.length; i++) {
		var items = content[i];
		for (var j = 0; j < items.length; j++) {
			var rendered = renderItem.call(items[j], this.editor);
			if (rendered) frag.appendChild(rendered);
		}
	}
	this.menu.place.textContent = ""
	this.menu.place.appendChild(document.adoptNode(frag));
	if (!this.menu.place.querySelector('.item:not(.disabled)')) {
		this.menu.place.appendChild(document.dom`<a class="item">Text only content</a>`);
	}
};

Menu.prototype.item = function(el) {
	var editor = this.editor;
	var schema = editor.state.schema;
	var nodeType = schema.nodes[el.name] || schema.marks[el.name];
	if (!nodeType || (!el.menu && !el.icon)) return;

	var self = this;

	var item = {
		element: el,
		onDeselected: 'disable',
		run: function(state, dispatch, view) {
			var tr = state.tr;
			var sel = tr.selection;
			if (el.inline) {
				editor.utils.toggleMark(nodeType)(state, function(tr) {
					tr.setMeta('editor', true);
					dispatch(tr);
				});
			} else {
				var block = editor.blocks.create(el.name);
				if (typeof el.contents == "string") {
					// dirty trick to make "from" not generate an id for that block
					block.id = null;
				}

				editor.blocks.from(block).then(function(fragment) {
					sel = editor.utils.selectTr(tr, self.selection, true);
					if (editor.utils.insertTr(tr, fragment, sel)) {
						tr.setMeta('editor', true);
						dispatch(tr);
					}
				});
			}
		},
		select: function(state) {
			if (el.inline) {
				return editor.utils.canMark(self.selection, nodeType);
			} else {
				return editor.utils.canInsert(self.selection, nodeType);
			}
		},
		active: function(state) {
			if (!el.inline) {
				var parents = editor.utils.selectionParents(state.tr);
				if (!parents.length) return false;
				var parent = parents[0];
				return parent.root && parent.root.node && parent.root.node.type.name == el.name;
			} else {
				return editor.utils.markActive(self.selection, nodeType);
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

