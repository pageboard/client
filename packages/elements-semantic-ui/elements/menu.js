Pageboard.elements.menu = {
	title: "Menu",
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
	group: "block",
	icon: '<b class="icon">Menu</b>',
	render: function(doc, block, view) {
		return doc.dom`<div class="ui simple dropdown item">
			<div class="text" block-content="title"></div>
			<div class="menu" block-content="items"></div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/dropdown.css',
		'../ui/menu.css'
	]
};

Pageboard.elements.menu_item = {
	title: "Item",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				media: "link"
			}
		}
	},
	contents: {
		content: {
			spec: "text*"
		}
	},
	icon: '<b class="icon">Item</b>',
	render: function(doc, block) {
		return doc.dom`<div class="item" block-content="content"></div>`;
	}
};

