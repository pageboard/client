/* global Pagecut */
Pageboard.Controls.Menu = class Menu {
	static tabs = ["section", "media", "widget", "link", "form"];

	static renderItem(item, view, name) {
		let disabled = false;
		const spec = item.spec;
		const el = spec.element;
		if (spec.select && !spec.select(view.state)) {
			if (spec.onDeselected == "disable" || el.name == name) {
				disabled = true;
			} else {
				return null;
			}
		}

		const active = !disabled && spec.active?.(view.state);
		const icon = (str => {
			if (/<svg/i.test(str) || str.startsWith('<')) {
				return str;
			} else {
				return `<img class="icon" src="${str}" />`;
			}
		})(el.icon);

		const title = el.inline ? "" : el.title;

		const dom = document.dom(`<a class="item [active] [disabled]" title="[el.description]">
			[icon|as:html|svg:]
			<span>[title|split: |join:%0A|as:text]</span>
		</a>`).fuse({
			active, icon, title, el
		}, {
			$filters: {
				svg(ctx, node) {
					if (node && node.nodeName == "SVG") node.setAttribute('class', 'icon');
					return node;
				}
			}
		});
		if (!disabled) {
			dom.addEventListener("mousedown", (e) => {
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
		for (const name of Menu.tabs) this.tab(name);
		this.menu = this.items();
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
		for (const tab of Object.values(this.tabs)) {
			tab.menu.classList.remove('active');
			tab.div.classList.remove('active');
		}
	}

	update(parents, sel) {
		this.selection = sel;
		this.parents = parents || [];
		for (const tab of Object.values(this.tabs)) {
			tab.div.textContent = '';
		}
		this.inlines.textContent = "";
		let isBlockSelection = false;
		if (sel) {
			let node = sel.node;
			if (!node) {
				// show block elements if there is empty block content
				// that should not happen anymore, thanks to placeholder
				node = sel.$to.parent;
				if (node?.type.spec.typeName && !node.content.size && node.isBlock && !node.isTextblock) {
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

		if (sel) this.menu.forEach(item => {
			const dom = Menu.renderItem(item, this.editor, sel.node?.type.name);
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
			inlineSpans.forEach(dom => inlinesMenu.firstElementChild.append(dom));
		}
		if (inlineBlocks.length) {
			const inlineBlocksMenu = this.inlines.dom(`<div class="right menu"></div>`);
			this.inlines.appendChild(inlineBlocksMenu);
			inlineBlocks.forEach(dom => inlineBlocksMenu.appendChild(dom));
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
		for (const tab of Object.values(this.tabs)) {
			tab.menu.classList.toggle('disabled', tab.div.children.length == 0);
		}
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
					const block = editor.blocks.create(el.name);
					if (el.inline) {
						if (el.leaf) {
							tr.replaceSelectionWith(nodeType.create(editor.blocks.toAttrs(block)));
							const resel = sel ? editor.utils.selectTr(tr, sel) : null;
							if (resel) tr.setSelection(resel);
						} else {
							editor.utils.toggleMark(
								nodeType,
								editor.blocks.toAttrs(block)
							)(state, (atr) => tr = atr);
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
					active = self.parents?.[0]?.node.type.name == el.name;
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
		for (const el of Object.values(this.editor.elements).sort((a, b) => {
			return (a.title ?? a.name).localeCompare(b.title ?? b.name);
		})) {
			const itemSpec = this.item(el);
			if (itemSpec) {
				list.push(new Pagecut.MenuItem(itemSpec));
			}
		}
		return list;
	}
};
