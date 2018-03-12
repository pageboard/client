Pageboard.elements.menu = {
	title: "Menu",
	menu: "link",
	contents: {
		items: {
			spec: "menu_item+",
			title: 'Items'
		}
	},
	properties: {
		direction: {
			title: 'Direction',
			default: "",
			anyOf: [{
				const: "",
				title: "horizontal"
			}, {
				const: "vertical",
				title: "vertical"
			}, {
				const: "compact",
				title: "compact"
			}]
		}
	},
	group: "block",
	icon: '<b class="icon">Menu</b>',
	render: function(doc, block, view) {
		var it = doc.dom`<div class="ui ${block.data.direction} menu" block-content="items"></div>`;
		return it;
	},
	stylesheets: [
		'../semantic-ui/menu.css',
		'../ui/menu.css'
	],
	scripts: [
		'../ui/menu.js'
	]
};

Pageboard.elements.menu_item_link = {
	title: "Link Item",
	menu: "link",
	priority: 10,
	context: "menu//",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
				name: 'href',
				filter: {
					type: "link"
				}
			}
		},
		template: {
			title: 'Template',
			description: 'Query template',
			type: 'string',
			context: 'query|form'
		}
	},
	contents: {
		content: {
			spec: "inline*"
		}
	},
	group: 'menu_item',
	icon: '<b class="icon">Item</b>',
	render: function(doc, block) {
		var d = block.data;
		var a = doc.dom`<a class="item" href="${d.url}" block-content="content"></a>`;
		if (a.hostname != document.location.hostname) a.rel = "noopener";
		if (d.template) a.setAttribute('attr-href', d.template);
		return a;
	}
};

Pageboard.elements.menu_item_dropdown = {
	title: "Dropdown",
	menu: "link",
	priority: 11,
	context: "menu//",
	contents: {
		title: {
			spec: "inline*",
			title: "Title"
		},
		items: {
			spec: "menu_item+",
			title: 'Items'
		}
	},
	properties: {
		icon: {
			title: 'Show dropdown icon',
			type: 'boolean',
			default: false
		}
	},
	group: "menu_item",
	icon: '<b class="icon">Drop</b>',
	render: function(doc, block, view) {
		return doc.dom`<div tabindex="0" class="ui simple dropdown item ${block.focused ? 'active' : ''}">
			<div class="title ${block.data.icon ? 'caret-icon' : ''}" block-content="title"></div>
			<div class="menu" block-content="items"></div>
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/dropdown.css'
	]
};

Pageboard.elements.menu_item_popup = {
	title: "Popup",
	menu: "link",
	priority: 11,
	context: "menu//",
	contents: {
		title: {
			spec: "inline*",
			title: "Title"
		},
		content: {
			spec: "block+",
			title: 'Content'
		}
	},
	properties: {
		icon: {
			title: 'Show dropdown icon',
			type: 'boolean',
			default: false
		}
	},
	group: "menu_item",
	icon: '<b class="icon">Pop</b>',
	render: function(doc, block, view) {
		return doc.dom`<div tabindex="0" class="ui simple dropdown item">
			<div class="title ${block.data.icon ? 'caret-icon' : ''}" block-content="title"></div>
			<div class="popup">
				<div block-content="content"></div>
			</div>
		</div>`;
	}
};

