Pageboard.elements.medialist = {
	priority: 20,
	title: "List",
	icon: '<i class="list icon"></i>',
	menu: "widget",
	properties: {
	},
	contents: {
		items: {
			spec: "medialist_item+",
			title: 'items'
		}
	},
	html: '<div class="ui items unstackable medialist" block-content="items"></div>',
	stylesheets: [
		'../semantic-ui/item.css',
		'../ui/medialist.css',
	]
};

Pageboard.elements.medialist_item = {
	title: "Item",
	icon: '<i class="icons"><i class="list icon"></i><i class="corner add icon"></i></i>',
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
	html: `<div class="item">
		<div class="image" block-content="media"></div>
		<div class="content" block-content="content"></div>
	</div>`
};

