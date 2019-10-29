exports.menu = {
	title: "Menu",
	icon: '<b class="icon">Menu</b>',
	menu: "link",
	upgrade: {
		'content.items': 'content.'
	},
	contents: "(menu_item|menu_group)+",
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
		}
	},
	group: "block",
	html: `<div class="ui [direction] menu"></div>`,
	stylesheets: [
		'../lib/components/menu.css'
	]
};

exports.menu_group = {
	title: 'Menu Group',
	icon: '<b class="icon">Group</b>',
	menu: "link",
	context: "menu//",
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
		}
	},
	contents: {
		id: "items",
		nodes: "menu_item+"
	},
	html: `<element-menu class="[position] menu">
		<div block-content="items"></div>
		<div tabindex="0" class="ui fixed popup item">
			<div class="icon">≡</div>
			<div class="dropdown placer"><div class="menu"></div></div>
		</div>
	</element-menu>`,
	stylesheets: [
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
	icon: '<b class="icon">Link</b>',
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
	html: '<a class="item" href="[url|autolink]">Link</a>'
};

exports.menu_item_text = {
	priority: 11,
	title: 'Text',
	icon: '<b class="icon">Item</b>',
	menu: "link",
	context: "menu//",
	contents: {
		nodes: "inline*"
	},
	group: 'menu_item',
	html: '<div class="item">Text</div>'
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
			default: false
		},
		position: {
			title: 'Position',
			anyOf: [{
				title: 'left',
				const: 'left'
			}, {
				title: 'center',
				const: 'center'
			}, {
				title: 'right',
				const: 'right'
			}, {
				title: 'justify',
				const: 'justify'
			}],
			default: 'center'
		},
		icon: {
			title: 'Show dropdown icon',
			type: 'boolean',
			default: false
		}
	},
	group: "menu_item",
	html: `<div tabindex="0" class="ui [position] [fixed|?] popup item">
		<div class="title [icon|?:caret-icon]" block-content="title">Popup</div>
		<div class="placer">
			<div block-content="content"></div>
		</div>
	</div>`
};

