exports.accordion = {
	title: "Accordion",
	icon: '<i class="caret right icon"></i>',
	menu: 'widget',
	group: "block",
	contents: "fold+",
	html: '<element-accordion class="ui accordion"></element-accordion>',
	stylesheets: [
		'../lib/components/accordion.css',
		'../ui/accordion.css'
	],
	scripts: [
		'../ui/accordion.js'
	]
};


exports.fold = {
	title: "Fold",
	icon: '<i class="icons"><i class="caret right icon"></i><i class="corner add icon"></i></i>',
	menu: 'widget',
	contents: [{
		id: 'title',
		nodes: "inline*",
		title: 'title'
	}, {
		id: 'content',
		nodes: 'block+',
		title: 'content'
	}],
	html: `<div class="fold">
		<div class="title caret-icon" block-content="title">Title</div>
		<div class="content" block-content="content"></div>
	</div>`
};

