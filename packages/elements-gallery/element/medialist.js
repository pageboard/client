Pageboard.elements.medialist = {
	priority: 20,
	title: "List",
	menu: "widget",
	properties: {
	},
	contents: {
		items: {
			spec: "medialist_item+",
			title: 'items'
		}
	},
	icon: '<i class="list icon"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="ui items unstackable medialist" block-content="items"></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/item.css',
		'../ui/medialist.css',
	]
};

Pageboard.elements.medialist_item = {
	title: "Item",
	menu: "widget",
	context: "medialist/",
	properties: {},
	contents: {
		media: {
			spec: "image",
			title: "media"
		},
		content: {
			spec: "block+",
			title: "content"
		}
	},
	icon: '<i class="add icon"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="item">
			<div class="image" block-content="media"></div>
			<div class="content" block-content="content"></div>
		</div>`;
	}
};

