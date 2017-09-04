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
				constant: "",
				title: "horizontal"
			}, {
				constant: "vertical",
				title: "vertical"
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
	context: "menu//",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				media: ["link", "page"]
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
		return doc.dom`<a class="item" href="${block.data.url}" block-content="content"></a>`;
	}
};

Pageboard.elements.menu_item_dropdown = {
	title: "Dropdown",
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
		return doc.dom`<div class="ui simple dropdown item ${block.focused ? 'active' : ''}">
			<div block-content="title"></div>
			<i class="dropdown icon"></i>
			<div class="menu" block-content="items"></div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/dropdown.css'
	]
};
