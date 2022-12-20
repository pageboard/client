class HTMLElementInputHTML extends HTMLTextAreaElement {
	#editor;

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
			icon: '<i class="icon bold"></i>',
			tag: 'strong,b',
			html: '<strong></strong>'
		},
		em: {
			title: "Emphasize",
			contents: "text*",
			inplace: true,
			inline: true,
			group: "inline nolink",
			icon: '<b class="icon">em</b>',
			tag: 'em,i',
			html: '<em></em>'
		},
		link: {
			title: "Link",
			icon: '<i class="icon linkify"></i>',
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
		const textarea = doc.dom(`<div class="textarea">${this.value}</div>`);
		this.parentNode.insertBefore(textarea, this);
		const toolbar = doc.dom(`<div class="toolbar"></div>`);
		this.parentNode.insertBefore(toolbar, textarea);

		const els = {};
		for (const [name, el] of Object.entries(this.constructor.elements)) {
			const copy = { ...el };
			Pageboard.install(copy, state.scope);
			els[name] = copy;
		}
		const update = Pageboard.debounce(editor => {
			this.value = editor.to()?.content[""];
		}, 500);
		this.#editor = new window.Pagecut.Editor({
			topNode: 'fragment',
			store: {},
			elements: els,
			content: textarea,
			scope: state.scope,
			plugins: [{
				view: function () {
					return {
						update: editor => update(editor)
					};
				}
			}]
		});
		textarea.spellcheck = false;
	}

	close() {
		this.#editor?.destroy();
	}
}
Page.setup(() => {
	VirtualHTMLElement.define('element-input-html', HTMLElementInputHTML, 'textarea');
});
