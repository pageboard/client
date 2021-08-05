/* global Pagecut */
Pageboard.Controls.Menu = class Menu {
	static tabs = ["section", "media", "widget", "link", "form"];

	static renderItem(item, view, name) {
		let disabled = false;
		const spec = item.spec;
		if (spec.select && !spec.select(view.state)) {
			if (spec.onDeselected == "disable" || spec.element.name == name) {
				disabled = true;
			} else {
				return null;
			}
		}
		const active = spec.active && !disabled && spec.active(view.state);

		const dom = document.createElement('a');
		dom.className = "item";

		const icon = spec.element.icon;
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

	constructor(editor, node) {
		this.editor = editor;
		this.node = node;
		this.tabDiv = this.node.appendChild(this.node.dom('<div></div>'));
		this.tabMenu = this.tabDiv.appendChild(
			this.node.dom(`<div class="ui top attached tabular mini menu"></div>`)
		);
		this.tabs = {};
		this.lastTab;
		Menu.tabs.forEach(function (name) {
			this.tab(name);
		}, this);
		this.menu = new Pagecut.Menubar({
			items: this.items()
		});
		this.tabMenu.addEventListener('click', this, false);
		this.inlines = this.node.dom(`<div class="ui icon menu"></div>`);
		this.node.appendChild(this.inlines);
		this.update();
	}

	destroy() {
		this.tabMenu.removeEventListener('click', this, false);
		this.node.textContent = "";
	}

	handleEvent(e) {
		const item = e.target.closest('.item');
		if (!item || item.matches('.disabled')) return;
		this.showTab(item.dataset.tab);
	}

	showTab(name) {
		this.lastTab = name;
		this.hideTabs();
		this.tabMenu.removeAttribute('hidden');
		const tab = this.tabs[name];
		tab.menu.classList.add('active');
		tab.div.classList.add('active');
	}

	hideTabs() {
		this.tabMenu.setAttribute('hidden', '');
		for (const k in this.tabs) {
			this.tabs[k].menu.classList.remove('active');
			this.tabs[k].div.classList.remove('active');
		}
	}

	update(parents, sel) {
		this.selection = sel;
		this.parents = parents || [];
		Object.values(this.tabs).forEach(function (tab) {
			tab.div.textContent = '';
		});
		this.inlines.textContent = "";
		let isBlockSelection = false;
		if (sel) {
			let node = sel.node;
			if (!node) {
				// show block elements if there is empty block content
				// that should not happen anymore, thanks to placeholder
				node = sel.$to.parent;
				if (node && node.type.spec.typeName && !node.content.size && node.isBlock && !node.isTextblock) {
					isBlockSelection = true;
				}
			} else {
				isBlockSelection = node.isBlock;
			}
		}
		const isRootSelection = this.parents.length == 1;
		let activeTab;
		const inlineBlocks = [];
		const inlineSpans = [];
		let inlineSpansActive = false;

		if (sel) this.menu.items.forEach((item) => {
			const dom = Menu.renderItem(item, this.editor, sel.node && sel.node.type.name || null);
			if (!dom) return;
			const el = item.spec.element;
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
				const menu = el.menu || 'section';
				this.tab(menu).appendChild(dom);
				if (!activeTab && dom.matches('.active')) activeTab = menu;
			}
		});
		if (inlineSpans.length && !isRootSelection) {
			this.inlines.appendChild(this.inlines.dom(`<div class="item ${inlineSpansActive ? 'has-active' : ''}">
			<i class="large dropdown icon" style="margin:0"></i>
		</div>`));
			const inlinesMenu = this.inlines.dom(`<div class="popup">
			<div class="ui icon menu"></div>
		</div>`);
			this.inlines.appendChild(inlinesMenu);
			inlineSpans.forEach((dom) => inlinesMenu.firstElementChild.append(dom));
		}
		if (inlineBlocks.length) {
			const inlineBlocksMenu = this.inlines.dom(`<div class="right menu"></div>`);
			this.inlines.appendChild(inlineBlocksMenu);
			inlineBlocks.forEach((dom) => inlineBlocksMenu.appendChild(dom));
		}
		if (isBlockSelection) {
			if (!activeTab) {
				if (this.lastTab && this.tab(this.lastTab).children.length) {
					activeTab = this.lastTab;
				} else {
					activeTab = Object.keys(this.tabs).find(name => {
						const tab = this.tabs[name];
						return tab.div.children.length > 0;
					}) || 'section';
				}
			}
			this.showTab(activeTab);
		} else {
			this.hideTabs();
		}
		Object.values(this.tabs).forEach(function (tab) {
			tab.menu.classList.toggle('disabled', tab.div.children.length == 0);
		});
	}

	tab(name) {
		let tab = this.tabs[name];
		if (!tab) {
			this.tabs[name] = tab = {
				menu: this.node.dom(`<a class="item" data-tab="${name}">${name}</a>`),
				div: this.node.dom(`<div class="ui mini labeled icon menu attached tab" data-tab="${name}"></div>`)
			};
			this.tabMenu.appendChild(tab.menu);
			this.tabDiv.appendChild(tab.div);
		}
		return tab.div;
	}

	item(el) {
		const editor = this.editor;
		const schema = editor.state.schema;
		const nodeType = schema.nodes[el.name] || schema.marks[el.name];
		if (!nodeType || !el.icon) return;

		const self = this;

		const item = {
			element: el,
			run: function (state, dispatch, view) {
				try {
					let tr = state.tr;
					let sel = self.selection;
					const block = editor.blocks.create(el.alias || el.name);
					if (el.inline) {
						if (el.leaf) {
							tr.replaceSelectionWith(nodeType.create(editor.blocks.toAttrs(block)));
							const resel = sel ? editor.utils.selectTr(tr, sel) : null;
							if (resel) tr.setSelection(resel);
						} else {
							editor.utils.toggleMark(nodeType, editor.blocks.toAttrs(block))(state, function (atr) {
								tr = atr;
							});
						}
					} else {
						const blocks = {};
						const fragment = editor.blocks.renderFrom(block, blocks, null, { type: el.name });
						const pos = editor.utils.insertTr(tr, fragment, sel);
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
			select: function (state) {
				let can;
				if (el.inline && !nodeType.isAtom) {
					can = editor.utils.canMark(self.selection, nodeType);
				} else {
					const sel = self.selection;
					can = Boolean(editor.utils.canInsert(sel.$to, nodeType, false, false).node);
					if (!can && sel.node) {
						can = Boolean(editor.utils.canInsert(sel.$from, nodeType, false, true).node);
					}
				}
				return can;
			},
			active: function (state) {
				let active;
				if (!el.inline || el.leaf) {
					const parent = self.parents.length && self.parents[0];
					active = parent && parent.node.type.name == el.name;
				} else {
					active = editor.utils.markActive(state.tr.selection, nodeType);
				}
				return active;
			}
		};
		return item;
	}
	items() {
		const list = [];
		Object.values(this.editor.elements).sort(function(a, b) {
			const ap = a.priority != null ? a.priority : Infinity;
			const bp = b.priority != null ? b.priority : Infinity;
			if (ap < bp) return -1;
			else if (ap > bp) return 1;
			else return a.name.localeCompare(b.name);
		}).forEach(function(el) {
			const itemSpec = this.item(el);
			if (!itemSpec) return;
			list.push(new Pagecut.Menubar.Menu.MenuItem(itemSpec));
		}, this);
		return list;
	}
};
