/* global $ */
(function(Pageboard, Pagecut) {

Pageboard.Controls.Menu = Menu;

Menu.tabs = ["common", "widget", "link", "form"];

function Menu(editor, node) {
	this.editor = editor;
	this.node = node;
	this.tabMenu = this.node.dom(`<div class="ui top attached tabular mini menu"></div>`);
	this.node.appendChild(this.tabMenu);
	this.tabs = {};
	this.lastTab;
	this.inlines = this.node.dom(`<div class="ui icon menu"></div>`);
	this.node.appendChild(this.inlines);
	Menu.tabs.forEach(function(name) {
		this.tab(name);
	}, this);
	this.menu = new Pagecut.Menubar({
		items: this.items()
	});
	var me = this;
	this.tabMenu.addEventListener('click', function(e) {
		var item = e.target.closest('.item');
		if (!item || item.matches('.disabled')) return;
		me.showTab(item.dataset.tab);
	});
}

Menu.prototype.destroy = function() {
	$(this.tabMenu).off('click');
	this.node.textContent = "";
};

Menu.prototype.showTab = function(name) {
	this.lastTab = name;
	this.hideTabs();
	this.tabMenu.removeAttribute('hidden');
	var tab = this.tabs[name];
	tab.menu.classList.add('active');
	tab.div.classList.add('active');
};

Menu.prototype.hideTabs = function() {
	this.tabMenu.setAttribute('hidden', '');
	for (var k in this.tabs) {
		this.tabs[k].menu.classList.remove('active');
		this.tabs[k].div.classList.remove('active');
	}
};

Menu.prototype.update = function(parents, sel) {
	if (!sel || !parents) return;
	// because updates are done by the editor
	this.selection = sel;
	this.parents = parents;
	Object.values(this.tabs).forEach(function(tab) {
		tab.div.textContent = '';
	});
	this.inlines.textContent = "";
	var isBlockSelection = sel.node && sel.node.isBlock;
	var activeTab;
	this.menu.items.forEach(function(item) {
		var dom = renderItem(item, this.editor);
		if (!dom) return;
		if (item.spec.element.inline) {
			if (!isBlockSelection) this.inlines.appendChild(dom);
		} else if (isBlockSelection) {
			var menu = item.spec.element.menu || 'common';
			this.tab(menu).appendChild(dom);
			if (!activeTab && dom.matches('.active')) activeTab = menu;
		}
	}, this);
	Object.values(this.tabs).forEach(function(tab) {
		tab.menu.classList.toggle('disabled', tab.div.children.length == 0);
	});
	if (isBlockSelection) {
		if (!activeTab) {
			if (this.lastTab && this.tab(this.lastTab).children.length) activeTab = this.lastTab;
			else activeTab = "common";
		}
		this.showTab(activeTab);
	} else {
		this.hideTabs();
	}
};

Menu.prototype.tab = function(name) {
	var tab = this.tabs[name];
	if (!tab) {
		this.tabs[name] = tab = {
			menu: this.node.dom(`<a class="item" data-tab="${name}">${name}</a>`),
			div: this.node.dom(`<div class="ui mini labeled icon menu attached tab" data-tab="${name}"></div>`)
		};
		this.tabMenu.appendChild(tab.menu);
		this.node.insertBefore(tab.div, this.inlines);
	}
	return tab.div;
};

Menu.prototype.item = function(el) {
	var editor = this.editor;
	var schema = editor.state.schema;
	var nodeType = schema.nodes[el.name] || schema.marks[el.name];
	if (!nodeType || !el.icon) return;

	var self = this;

	var item = {
		element: el,
		run: function(state, dispatch, view) {
			try {
				var tr = state.tr;
				var sel = self.selection;
				var block = editor.blocks.create(el.name);
				if (el.inline) {
					if (!el.contents) {
						tr.replaceSelectionWith(nodeType.create(editor.blocks.toAttrs(block)));
						var resel = sel ? editor.utils.selectTr(tr, sel) : null;
						if (resel) tr.setSelection(resel);
					} else {
						editor.utils.toggleMark(nodeType, editor.blocks.toAttrs(block))(state, function(atr) {
							tr = atr;
						});
					}
				} else {
					var blocks = {};
					var fragment = editor.blocks.renderFrom(block, blocks);
					editor.controls.store.importVirtuals(blocks);
					var pos = editor.utils.insertTr(tr, fragment, sel);
					if (pos != null) {
						sel = editor.utils.selectTr(tr, pos);
						if (sel) tr.setSelection(sel);
					}
				}
				tr.setMeta('editor', true);
				tr.scrollIntoView();
				dispatch(tr);
			} catch (err) {
				Pageboard.notify("Error while inserting " + el.title, err);
			}
		},
		select: function(state) {
			if (el.inline && !nodeType.isAtom) {
				return editor.utils.canMark(self.selection, nodeType);
			} else {
				var sel = self.selection;
				var can = !!editor.utils.canInsert(sel.$to, nodeType, false, false).node;
				if (!can && sel.node) {
					can = !!editor.utils.canInsert(sel.$from, nodeType, false, true).node;
				}
				return can;
			}
		},
		active: function(state) {
			if (!el.inline || !el.contents) {
				var parent = self.parents.length && self.parents[0];
				return parent && parent.node.type.name == el.name;
			} else {
				return editor.utils.markActive(state.tr.selection, nodeType);
			}
		}
	};
	return item;
};


function renderItem(item, view) {
	var disabled = false;
	var spec = item.spec;
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
	if (!spec.element.inline) {
		dom.appendChild(document.createTextNode('\n' + spec.element.title));
	}
	if (active) {
		dom.classList.add("active");
	}
	if (spec.element.description) {
		dom.setAttribute("title", spec.element.description);
	}
	if (disabled) {
		dom.classList.add("disabled");
	} else {
		dom.addEventListener("mousedown", function (e) {
			e.preventDefault();
			spec.run(view.state, view.dispatch, view);
		});
	}
	return dom;
}

Menu.prototype.items = function() {
	var list = [];
	Object.values(this.editor.elements).sort(function(a, b) {
		var ap = a.priority || 0;
		var bp = b.priority || 0;
		if (ap < bp) return -1;
		else if (ap > bp) return 1;
		else return a.name.localeCompare(b.name);
	}).forEach(function(el) {
		var itemSpec = this.item(el);
		if (!itemSpec) return;
		list.push(new Pagecut.Menubar.Menu.MenuItem(itemSpec));
	}, this);
	return list;
};

})(window.Pageboard, window.Pagecut);

