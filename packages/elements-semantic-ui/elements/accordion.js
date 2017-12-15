Pageboard.elements.accordion = {
	title: "Accordion",
	menu: 'widget',
	group: "block",
	contents: {
		folds: {
			spec: "fold+"
		}
	},
	properties: {

	},
	icon: '<i class="caret right icon"></i>',
	render: function(doc, block) {
		return doc.dom`<element-accordion class="ui accordion" block-content="folds"></element-accordion>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/accordion.css'
	],
	scripts: [
		'../ui/accordion.js'
	]
};


Pageboard.elements.fold = {
	title: "Fold",
	menu: 'widget',
	properties: {
	},
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
	icon: '<i class="caret right icon"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="fold">
			<div class="title">
				<i class="dropdown icon"></i>
				<span block-content="title">Title</span>
			</div>
			<div class="content" block-content="content"></div>
		</div>`;
	}
};

