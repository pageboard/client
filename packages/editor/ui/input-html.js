class MenuItemDialog extends window.Pagecut.MenuItem {
	#input;
	#editor;
	#el;
	constructor(el, editor) {
		const spec = { render: view => this.render(view) };
		super(spec);
		this.#el = el;
		this.#editor = editor;
	}
	#getMark(tr) {
		return this.#editor.utils.selectionParents(tr).shift()?.inline?.node.marks.find(
			m => m.type.name == this.#el.name
		);
	}
	render(editor) {
		const [name, schema] = Object.entries(this.#el.properties).shift();
		const inputType = {
			'uri-reference': 'url'
		}[schema.format] ?? 'text';
		const dom = this.dom = document.dom(
			`<form class="prosemirror-dialog">
				<input name="${name}" type="${inputType}" value="" title="${schema.title}" placeholder="https://...">
				<button>✓</button>
				<button name="del">✕</button>
			</form>`
		);
		const input = this.#input = dom.querySelector('input');

		dom.addEventListener('click', e => {
			if (e.target.name == "del") this.#input.value = "";
		});

		dom.addEventListener('submit', e => {
			const type = document.activeElement.name;
			const { state } = this.#editor;
			const { tr } = state;
			e.preventDefault();

			const mark = this.#getMark(tr);
			if (!mark) return;
			const sel = tr.selection;
			const [from, to] = this.#editor.utils.extendUpdateMark(
				tr, sel.from, sel.to, mark
			);
			const markDom = this.#editor.utils.posToDOM(from)?.parentNode;
			if (!markDom) return;
			if (type != "del") {
				this.#editor.utils.refreshTr(tr, markDom, {
					type: markDom.getAttribute('block-type'),
					data: {
						url: input.value ?? null
					}
				});
				tr.setSelection(sel.constructor.create(tr.doc, to, to));
				tr.removeStoredMark(mark.type);
			} else {
				tr.removeMark(from, to, mark.type);
				tr.setSelection(sel.constructor.create(tr.doc, to, to));
			}
			editor.dispatch(tr);
			editor.focus();
		});
		return { dom, update: state => this.update(state) };
	}
	update(state) {
		// why state is out of sync ?
		const mark = this.#getMark(this.#editor.state.tr);
		const isActive = Boolean(mark);
		this.dom.classList.toggle('ProseMirror-menu-active', isActive);

		// workaround other item is not updating properly
		this.dom.parentNode.previousElementSibling.firstElementChild.classList.toggle('ProseMirror-menu-active', isActive);

		const input = this.#input;
		try {
			const data = JSON.parse(mark.attrs.data ?? '{}');
			input.value = data.url ?? '';
		} catch (err) {
			input.value = '';
		}
		return true;
	}
}

class MenuBar extends window.Pagecut.MenuBar {
	constructor(editor, els, toolbar) {
		super({
			view: editor,
			items: MenuBar.menuitems(els, editor),
			place: toolbar
		});
	}

	static item(el, { state: { schema }, utils, blocks }) {
		const nodeType = schema.nodes[el.name] || schema.marks[el.name];
		if (!nodeType && !el.icon) return;

		const item = {
			element: el,
			icon: el.icon,
			run: function (state, dispatch) {
				let tr = state.tr;
				let sel = tr.selection;
				const block = blocks.create(el.name);
				if (el.inline) {
					if (el.leaf) {
						tr.replaceSelectionWith(nodeType.create(blocks.toAttrs(block)));
						const resel = sel ? utils.selectTr(tr, sel) : null;
						if (resel) tr.setSelection(resel);
					} else {
						utils.toggleMark(
							nodeType,
							blocks.toAttrs(block)
						)(state, (atr) => tr = atr);
					}
				} else {
					const blocks = {};
					const fragment = blocks.renderFrom(block, blocks, null, { type: el.name });
					const pos = utils.insertTr(tr, fragment, sel);
					if (pos != null) {
						sel = utils.selectTr(tr, pos);
						if (sel) tr.setSelection(sel);
					}
				}
				tr.setMeta('editor', true);
				tr.scrollIntoView();
				dispatch(tr);
			},
			select: function (state) {
				let can;
				const sel = state.tr.selection;
				if (el.inline && !nodeType.isAtom) {
					can = utils.canMark(sel, nodeType);
				} else {
					can = Boolean(utils.canInsert(sel.$to, nodeType, false, false).node);
					if (!can && sel.node) {
						can = Boolean(utils.canInsert(sel.$from, nodeType, false, true).node);
					}
				}
				return can;
			},
			active: function (state) {
				let active;
				const { tr } = state;
				if (!el.inline || el.leaf) {
					const parents = utils.selectionParents(tr);
					active = parents?.[0]?.root.node.type.name == el.name;
				} else {
					active = utils.markActive(tr.selection, nodeType);
				}
				return active;
			}
		};
		return item;
	}

	static menuitems(els, editor) {
		const list = [];
		for (const el of Object.values(els)) {
			if (!el.icon) continue;
			const item = this.item(el, editor);
			list.push(
				new window.Pagecut.MenuItem(item)
			);
			if (el.properties) {
				list.push(new MenuItemDialog(el, editor));
			}
		}
		return [list];
	}
}

class HTMLElementInputHTML extends Page.create(HTMLTextAreaElement) {
	#editor;
	#menu;
	#saver;

	static elements = {
		fragment: {
			contents: 'paragraph+',
			html: '<div class="textarea"></div>'
		},
		text: {
			inline: true,
			group: 'inline'
		},
		sup: {
			title: "Sup",
			icon: {
				width: 16, height: 16,
				path: "M16 5v1h-4V5s3.3-1.6 2.6-3.2c-.5-1.1-2-.2-2-.2l-.5-.9S14-.7 15.2.5C17.6 2.8 13.8 5 13.8 5H16zM12 3H8.6L6 6 3.4 3H0l4.3 5L0 13h3.4L6 10l2.6 3H12L7.7 8z"
			},
			contents: "text*",
			inline: true,
			inplace: true,
			group: "inline",
			tag: 'sup',
			html: '<sup></sup>'
		},
		sub: {
			title: "Inf",
			contents: "text*",
			inline: true,
			inplace: true,
			group: "inline",
			tag: 'sub',
			html: '<sub></sub>',
			icon: {
				width: 16, height: 16,
				path: "M16 15v1h-4v-1s3.3-1.6 2.6-3.2c-.5-1.1-2-.2-2-.2l-.5-.9s1.9-1.4 3.1-.2c2.4 2.3-1.4 4.5-1.4 4.5H16zM12 3H8.6L6 6 3.4 3H0l4.3 5L0 13h3.4L6 10l2.6 3H12L7.7 8z"
			}
		},
		hard_break: {
			inline: true,
			group: 'inline',
			inplace: true,
			tag: 'br',
			html: '<br />'
		},
		paragraph: {
			// title: "Paragraph",
			// icon: {
			// 	width: 16, height: 16,
			// 	path: "M5.5 0C3 0 1 2 1 4.5S3 9 5.5 9H8v7h2V2h1v14h2V2h2V0H5.5z"
			// },
			tag: 'p',
			isolating: false,
			contents: "inline*",
			group: "block",
			inplace: true,
			html: '<p></p>'
		},
		strong: {
			title: "Strong",
			contents: "text*",
			inplace: true,
			inline: true,
			group: "inline nolink",
			icon: {
				width: 805, height: 1024,
				path: "M317 869q42 18 80 18 214 0 214-191 0-65-23-102-15-25-35-42t-38-26-46-14-48-6-54-1q-41 0-57 5 0 30-0 90t-0 90q0 4-0 38t-0 55 2 47 6 38zM309 442q24 4 62 4 46 0 81-7t62-25 42-51 14-81q0-40-16-70t-45-46-61-24-70-8q-28 0-74 7 0 28 2 86t2 86q0 15-0 45t-0 45q0 26 0 39zM0 950l1-53q8-2 48-9t60-15q4-6 7-15t4-19 3-18 1-21 0-19v-37q0-561-12-585-2-4-12-8t-25-6-28-4-27-2-17-1l-2-47q56-1 194-6t213-5q13 0 39 0t38 0q40 0 78 7t73 24 61 40 42 59 16 78q0 29-9 54t-22 41-36 32-41 25-48 22q88 20 146 76t58 141q0 57-20 102t-53 74-78 48-93 27-100 8q-25 0-75-1t-75-1q-60 0-175 6t-132 6z"
			},
			tag: 'strong,b',
			html: '<strong></strong>'
		},
		em: {
			title: "Emphasize",
			contents: "text*",
			inplace: true,
			inline: true,
			group: "inline nolink",
			icon: {
				width: 585, height: 1024,
				path: "M0 949l9-48q3-1 46-12t63-21q16-20 23-57 0-4 35-165t65-310 29-169v-14q-13-7-31-10t-39-4-33-3l10-58q18 1 68 3t85 4 68 1q27 0 56-1t69-4 56-3q-2 22-10 50-17 5-58 16t-62 19q-4 10-8 24t-5 22-4 26-3 24q-15 84-50 239t-44 203q-1 5-7 33t-11 51-9 47-3 32l0 10q9 2 105 17-1 25-9 56-6 0-18 0t-18 0q-16 0-49-5t-49-5q-78-1-117-1-29 0-81 5t-69 6z"
			},
			tag: 'em,i',
			html: '<em></em>'
		},
		link: {
			title: "Link",
			icon: {
				width: 928, height: 929,
				path: "M819 683q0-22-16-38L685 527q-16-16-38-16-24 0-41 18l10 10 12 12 8 10q5 7 7 14t2 15q0 22-16 38t-38 16q-8 0-15-2t-14-7l-10-8-12-12-10-10q-18 17-18 41 0 22 16 38l117 118q15 15 38 15 22 0 38-14l84-83q16-16 16-38zM417 281q0-22-16-38L284 125q-16-16-38-16t-38 15l-84 83q-16 16-16 38t16 38l118 118q15 15 38 15 24 0 41-17l-10-10-12-12-8-10q-5-7-7-14t-2-15q0-22 16-38t38-16q8 0 15 2t14 7l10 8 12 12 10 10q18-17 18-41zm511 402q0 68-48 116l-84 83q-47 47-116 47t-116-48L447 763q-47-47-47-116 0-70 50-119l-50-50q-49 50-118 50-68 0-116-48L48 362Q0 314 0 246t48-116l84-83Q179 0 248 0t116 48l117 118q47 47 47 116 0 70-50 119l50 50q49-50 118-50 68 0 116 48l118 118q48 48 48 116z"
			},
			properties: {
				url: {
					title: 'Address',
					description: 'Path without query or full url',
					nullable: true,
					type: 'string',
					format: 'uri-reference',
					$helper: {
						name: 'href',
						filter: {
							type: ["link", "file", "archive"]
						}
					}
				}
			},
			parse(dom) {
				return { url: dom.href };
			},
			contents: "text*",
			inline: true,
			inplace: true,
			group: "inline",
			tag: 'a',
			html: '<a href="[url]"></a>'
		}
	};

	setup(state) {
		if (state.scope.$write) return;
		const doc = this.ownerDocument;
		if (this.previousElementSibling?.matches('.textarea')) return;
		const initialValue = super.value;
		const textarea = doc.dom(`<div class="textarea">${initialValue}</div>`);
		this.parentNode.insertBefore(textarea, this);
		const toolbar = doc.dom(`<div class="toolbar"></div>`);
		this.parentNode.insertBefore(toolbar, textarea);

		const elts = this.constructor.elements;
		const scope = state.scope.copy({ $elements: elts });
		scope.install();

		this.#saver = state.debounce(editor => {
			super.value = this.#editor.to()?.content[""];
		}, 100);


		this.#editor = new window.Pagecut.Editor({
			topNode: 'fragment',
			store: {},
			elements: elts,
			place: textarea,
			scope,
			plugins: [{
				view: () => {
					return {
						update: (view, state) => this.#update(state)
					};
				}
			}]
		});
		this.#menu = new MenuBar(this.#editor, elts, toolbar);
		textarea.spellcheck = false;
		this.value = initialValue;
	}

	set value(str) {
		if (this.#editor) this.#editor.dom.innerHTML = str;
		super.value = str;
	}

	#update(state) {
		this.#menu.update(state);
		this.#saver();
	}

	close() {
		this.#editor?.destroy();
	}
}

Page.define('element-input-html', HTMLElementInputHTML, 'textarea');

