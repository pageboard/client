exports.menu = {
	title: "Menu",
	icon: '<b class="icon">Menu</b>',
	menu: "link",
	upgrade: {
		'content.': 'content.items'
	},
	contents: {
		id: "items",
		nodes: "menu_item+"
	},
	properties: {
		direction: {
			title: 'Direction',
			anyOf: [{
				const: null,
				title: "horizontal"
			}, {
				const: "vertical",
				title: "vertical"
			}, {
				const: "compact",
				title: "compact"
			}]
		},
		position: {
			title: 'Position',
			anyOf: [{
				const: null,
				title: "left"
			}, {
				const: "right",
				title: "right"
			}]
		},
		symbol: {
			title: 'Symbol',
			type: 'string',
			maxLength: 1,
			minLength: 1,
			default: '▼'
		}
	},
	group: "block",
	html: `<element-menu class="ui [direction] menu">
		<div class="[position] [direction|neq:vertical:menu:]" block-content="items"></div>
		<div tabindex="0" class="ui simple dropdown right icon item tosser">
			<div class="icon">[symbol]</div>
			<div class="menu"></div>
		</div>
	</element-menu>`,
	stylesheets: [
		'../lib/components/menu.css',
		'../ui/menu.css'
	],
	scripts: [
		'../ui/menu.js'
	],
	polyfills: [
		'ResizeObserver'
	]
};

exports.menu_item_link = {
	priority: 10,
	title: "Link Item",
	icon: '<b class="icon">Item</b>',
	menu: "link",
	context: "menu//",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			nullable: true,
			type: 'string',
			format: 'uri-reference',
			$helper: {
				name: 'href',
				filter: {
					type: "link"
				}
			}
		}
	},
	contents: {
		nodes: "inline*",
		marks: "nolink"
	},
	group: 'menu_item',
	html: '<a class="item" href="[url|autolink]">Item</a>'
};

exports.menu_item_dropdown = {
	priority: 11,
	title: "Dropdown",
	icon: '<b class="icon">Drop</b>',
	menu: "link",
	context: "menu//",
	contents: [{
		id: 'title',
		nodes: "inline*",
		marks: "nolink",
		title: "Title"
	}, {
		id: 'items',
		nodes: "menu_item+",
		title: 'Items'
	}],
	properties: {
		position: {
			title: 'Position',
			anyOf: [{
				const: null,
				title: "left"
			}, {
				const: "right",
				title: "right"
			}]
		},
		icon: {
			title: 'Show dropdown icon',
			type: 'boolean',
			default: false
		}
	},
	group: "menu_item",
	html: `<div tabindex="0" class="ui simple [position] dropdown item [focused|?:active]">
		<div class="title [icon|?:caret-icon]" block-content="title">Dropdown</div>
		<div class="menu" block-content="items"></div>
	</div>`,
	stylesheets: [
		'../lib/components/dropdown.css'
	]
};

exports.menu_item_popup = {
	priority: 11,
	title: "Popup",
	icon: '<b class="icon">Pop</b>',
	menu: "link",
	context: "menu//",
	contents: [{
		id: 'title',
		nodes: "inline*",
		marks: "nolink",
		title: "Title"
	}, {
		id: 'content',
		nodes: 'block+',
		title: 'Content'
	}],
	properties: {
		fixed: {
			title: 'Fixed',
			type: 'boolean',
			nullable: true
		},
		icon: {
			title: 'Show dropdown icon',
			type: 'boolean',
			default: false
		}
	},
	group: "menu_item",
	html: `<div tabindex="0" class="ui simple dropdown item">
		<div class="title [icon|?:caret-icon]" block-content="title">Popup</div>
		<div class="[fixed|?] popup" block-content="content"></div>
	</div>`
};

