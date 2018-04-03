Pageboard.elements.accordion = {
	title: "Accordion",
	menu: 'widget',
	group: "block",
	contents: {
		folds: {
			spec: "fold+"
		}
	},
	icon: '<i class="caret right icon"></i>',
	render: function(doc, block) {
		return doc.dom`<element-accordion class="ui accordion" block-content="folds"></element-accordion>`;
	},
	stylesheets: [
		'../semantic-ui/accordion.css',
		'../ui/accordion.css'
	],
	scripts: [
		'../ui/accordion.js'
	]
};


Pageboard.elements.fold = {
	title: "Fold",
	menu: 'widget',
	contents: {
		title: {
			spec: "inline*",
			title: 'title'
		},
		content: {
			spec: 'block+',
			title: 'content'
		}
	},
	icon: '<i class="icons"><i class="caret right icon"></i><i class="corner add icon"></i></i>',
	render: function(doc, block) {
		return doc.dom`<div class="fold">
			<div class="title caret-icon" block-content="title">Title</div>
			<div class="content" block-content="content"></div>
		</div>`;
	}
};

