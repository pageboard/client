class HTMLElementInputHTML extends HTMLTextAreaElement {
	#editor;
	#menu;
	#saver;

	constructor() {
		super();
		if (this.init) this.init();
	}

	static elements = {
		fragment: {
			contents: 'paragraph+',
			html: '<div class="textarea"></div>'
		},
		text: {
			inline: true,
			group: 'inline'
		},
		hard_break: {
			inline: true,
			group: 'inline',
			inplace: true,
			tag: 'br',
			html: '<br />'
		},
		paragraph: {
			title: "Paragraph",
			icon: '<i class="icon paragraph"></i>',
			tag: 'p',
			isolating: false,
			contents: "inline*",
			group: "block",
			inplace: true,
			html: '<p>Text</p>'
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
			parse: function (dom) {
				return { url: dom.href };
			},
			contents: "text*",
			inline: true,
			inplace: true,
			group: "inline",
			tag: 'a',
			html: '<a href="[url|autolink]"></a>'
		}
	};

	setup(state) {
		if (this.isContentEditable) return;
		const doc = this.ownerDocument;
		if (this.previousElementSibling?.matches('.textarea')) return;
		const textarea = doc.dom(`<div class="textarea">${this.textContent}</div>`);
		this.parentNode.insertBefore(textarea, this);
		const toolbar = doc.dom(`<div class="toolbar"></div>`);
		this.parentNode.insertBefore(toolbar, textarea);

		const els = {};
		for (const [name, el] of Object.entries(this.constructor.elements)) {
			const copy = { ...el };
			Pageboard.install(copy, state.scope);
			els[name] = copy;
		}

		const initialValue = this.textContent;

		this.#saver = Pageboard.debounce(editor => {
			super.value = this.#editor.to()?.content[""];
		}, 100);


		this.#editor = new window.Pagecut.Editor({
			topNode: 'fragment',
			store: {},
			elements: els,
			place: textarea,
			scope: state.scope,
			plugins: [{
				view: () => {
					return {
						update: () => this.#update()
					};
				}
			}]
		});
		this.value = initialValue;

		this.#menu = new window.Pagecut.Menubar({
			items: this.#menuitems(els),
			place: toolbar
		});
		textarea.spellcheck = false;
	}

	set value(str) {
		if (this.#editor) this.#editor.dom.innerHTML = str;
		super.value = str;
	}

	#update() {
		this.#menu.update(this.#editor);
		this.#saver();
	}

	#item(el) {
		const editor = this.#editor;
		const schema = editor.state.schema;
		const nodeType = schema.nodes[el.name] || schema.marks[el.name];
		if (!nodeType || !el.icon) return;

		const self = this;

		const item = {
			element: el,
			render(view) {
				const div = document.createElement('div');
				div.innerHTML = el.name;
				return div;
			},
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

	#menuitems(els) {
		const item = new window.Pagecut.Menubar.Menu.MenuItem(this.#item(
			els.strong
		));
		return [[item]];
	}

	close() {
		this.#editor?.destroy();
	}
}
Page.setup(() => {
	VirtualHTMLElement.define('element-input-html', HTMLElementInputHTML, 'textarea');
});
