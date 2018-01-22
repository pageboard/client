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
			oneOf: [{
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
		'../semantic-ui/menu.css'
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
			oneOf: [{
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
		var a = doc.dom`<a class="item" href="${block.data.url}" block-content="content"></a>`;
		if (a.hostname != document.location.hostname) a.rel = "noopener";
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
			spec: "text*",
			title: "Title"
		},
		items: {
			spec: "menu_item+",
			title: 'Items'
		}
	},
	group: "menu_item",
	icon: '<b class="icon">Drop</b>',
	render: function(doc, block, view) {
		return doc.dom`<div tabindex="0" class="ui simple dropdown item ${block.focused ? 'active' : ''}">
			<div class="title">
				<span block-content="title">Title</span>
				<i class="dropdown icon"></i>
			</div>
			<div class="menu" block-content="items"></div>
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/dropdown.css',
		'../ui/dropdown.css'
	]
};

Pageboard.elements.menu_item_popup = {
	title: "Popup",
	menu: "link",
	priority: 11,
	context: "menu//",
	contents: {
		title: {
			spec: "text*",
			title: "Title"
		},
		content: {
			spec: "block+",
			title: 'Content'
		}
	},
	properties: {

	},
	group: "menu_item",
	icon: '<b class="icon">Pop</b>',
	render: function(doc, block, view) {
		return doc.dom`<div tabindex="0" class="ui simple dropdown item ${block.focused ? 'active' : ''}">
			<div class="title">
				<span block-content="title">Title</span>
				<i class="dropdown icon"></i>
			</div>
			<div class="ui fluid popup" block-content="content"></div>
		</div>`;
	},
	stylesheets: [
		'../semantic-ui/popup.css',
		'../ui/popup.css'
	]
};

