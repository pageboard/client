Pageboard.elements.menu = {
	title: "Menu",
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
		'/.pageboard/semantic-ui/components/menu.css'
	],
	scripts: [
		'../ui/menu.js'
	]
};

Pageboard.elements.menu_item_link = {
	title: "Link Item",
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
				pattern: "^(\/[a-zA-Z0-9-._]*)+$"
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
	icon: '<b class="icon">Pop</b>',
	render: function(doc, block, view) {
		// the empty div is only here to wrap
		return doc.dom`<div class="ui simple dropdown item ${block.focused ? 'active' : ''}">
			<div class="title">
				<span block-content="title"></span>
				<i class="dropdown icon"></i>
			</div>
			<div class="menu" block-content="items"></div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/dropdown.css'
	]
};
