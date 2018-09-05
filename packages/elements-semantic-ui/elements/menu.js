Pageboard.elements.menu = {
	title: "Menu",
	icon: '<b class="icon">Menu</b>',
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
	html: '<div class="ui [direction] menu" block-content="items"></div>',
	stylesheets: [
		'../semantic-ui/menu.css',
		'../ui/menu.css'
	],
	scripts: [
		'../ui/menu.js'
	]
};

Pageboard.elements.menu_item_link = {
	priority: 10,
	title: "Link Item",
	icon: '<b class="icon">Item</b>',
	menu: "link",
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
			$helper: {
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
			spec: "inline*",
			marks: "nolink"
		}
	},
	group: 'menu_item',
	html: '<a class="item" href="[url]" data-href="[template]" block-content="content">Item</a>',
	fuse: function(node, d, scope) {
		node.fuse(d);
		Pageboard.elements.link.auto(node, scope.$hrefs);
	}
};

Pageboard.elements.menu_item_dropdown = {
	priority: 11,
	title: "Dropdown",
	icon: '<b class="icon">Drop</b>',
	menu: "link",
	context: "menu//",
	contents: {
		title: {
			spec: "inline*",
			marks: "nolink",
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
	html: `<div tabindex="0" class="ui simple dropdown item [focused|?:active]">
		<div class="title [icon|?:caret-icon]" block-content="title">Dropdown</div>
		<div class="menu" block-content="items"></div>
	</div>`,
	stylesheets: [
		'../semantic-ui/dropdown.css'
	]
};

Pageboard.elements.menu_item_popup = {
	priority: 11,
	title: "Popup",
	icon: '<b class="icon">Pop</b>',
	menu: "link",
	context: "menu//",
	contents: {
		title: {
			spec: "inline*",
			marks: "nolink",
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
	html: `<div tabindex="0" class="ui simple dropdown item">
		<div class="title [icon|?:caret-icon]" block-content="title">Popup</div>
		<div class="popup">
			<div block-content="content"></div>
		</div>
	</div>`
};

