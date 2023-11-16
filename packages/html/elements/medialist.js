exports.medialist = {
	title: "List",
	priority: 20,
	group: "block",
	icon: '<i class="list icon"></i>',
	menu: "widget",
	contents: "medialist_item+",
	html: '<div class="ui items unstackable medialist"></div>',
	stylesheets: [
		'../ui/item.css',
	]
};

exports.medialist_item = {
	title: "Item",
	icon: '<i class="icons"><i class="list icon"></i><i class="corner add icon"></i></i>',
	menu: "widget",
	context: "medialist/",
	contents: [{
		nodes: "image",
		id: 'media',
		title: "media"
	}, {
		id: 'content',
		nodes: "block+",
		title: "content"
	}],
	html: `<div class="item">
		<div class="image" block-content="media"></div>
		<div class="content" block-content="content"></div>
	</div>`
};

