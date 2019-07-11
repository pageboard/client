/* global $ */
(function(Pageboard, Pagecut) {

Pageboard.Controls.Menu = Menu;

Menu.tabs = ["common", "widget", "link", "form"];

function Menu(editor, node) {
	this.editor = editor;
	this.node = node;
	this.tabDiv = this.node.appendChild(this.node.dom('<div></div>'));
	this.tabMenu = this.tabDiv.appendChild(
		this.node.dom(`<div class="ui top attached tabular mini menu"></div>`)
	);
	this.tabs = {};
	this.lastTab;
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
	this.inlines = this.node.dom(`<div class="ui icon menu"></div>`);
	this.node.appendChild(this.inlines);
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
	var isRootSelection = this.parents.length == 1;
	var activeTab;
	var inlineBlocks = [];
	var inlineSpans = [];
	var inlineSpansActive = false;
	
	this.menu.items.forEach((item) => {
		var dom = renderItem(item, this.editor, sel.node && sel.node.type.name || null);
		if (!dom) return;
		var el = item.spec.element;
		if (isRootSelection) {
			// do nothing
		} else if (el.inline) {
			if (!isBlockSelection) {
				if (!el.leaf) {
					if (['link', 'strong', 'i', 'u'].includes(el.name) == false) {
						inlineSpans.push(dom);
						if (dom.matches('.active')) inlineSpansActive = true;
					} else {
						this.inlines.appendChild(dom);
					}
				} else {
					inlineBlocks.push(dom);	
				}
			}
		} else if (isBlockSelection) {
			var menu = el.menu || 'common';
			this.tab(menu).appendChild(dom);
			if (!activeTab && dom.matches('.active')) activeTab = menu;
		}
	});
	if (inlineSpans.length && !isRootSelection) {
		this.inlines.appendChild(this.inlines.dom(`<div class="item ${inlineSpansActive ? 'has-active' : ''}">
			<i class="large dropdown icon" style="margin:0"></i>
		</div>`));
		var inlinesMenu = this.inlines.dom(`<div class="popup">
			<div class="ui icon menu"></div>
		</div>`);
		this.inlines.appendChild(inlinesMenu);
		inlineSpans.forEach((dom) => inlinesMenu.firstElementChild.append(dom));
	}
	if (inlineBlocks.length) {
		var inlineBlocksMenu = this.inlines.dom(`<div class="right menu"></div>`);
		this.inlines.appendChild(inlineBlocksMenu);
		inlineBlocks.forEach((dom) => inlineBlocksMenu.appendChild(dom));
	}
	Object.values(this.tabs).forEach(function(tab) {
		tab.menu.classList.toggle('disabled', tab.div.children.length == 0);
	});
	if (isBlockSelection) {
		if (!activeTab) {
			if (this.lastTab && this.tab(this.lastTab).children.length) {
				activeTab = this.lastTab;
			} else {
				activeTab = Object.keys(this.tabs).find(name => {
					var tab = this.tabs[name];
					return tab.div.children.length > 0;
				}) || 'common';
			}
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
		this.tabDiv.appendChild(tab.div);
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
					if (el.leaf) {
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
					// NOT SURE importVirtuals is meaningful here
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
			var can;
			if (el.inline && !nodeType.isAtom) {
				can = editor.utils.canMark(self.selection, nodeType);
			} else {
				var sel = self.selection;
				can = !!editor.utils.canInsert(sel.$to, nodeType, false, false).node;
				if (!can && sel.node) {
					can = !!editor.utils.canInsert(sel.$from, nodeType, false, true).node;
				}
			}
			return can;
		},
		active: function(state) {
			var active;
			if (!el.inline || el.leaf) {
				var parent = self.parents.length && self.parents[0];
				active = parent && parent.node.type.name == el.name;
			} else {
				active = editor.utils.markActive(state.tr.selection, nodeType);
			}
			return active;
		}
	};
	return item;
};


function renderItem(item, view, name) {
	var disabled = false;
	var spec = item.spec;
	if (spec.select && !spec.select(view.state)) {
		if (spec.onDeselected == "disable" || spec.element.name == name) {
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

