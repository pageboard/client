Pageboard.elements.header = {
	title: "Header",
	properties: {},
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	menu: 'layout',
	view: function(doc, block) {
		return doc.dom`<div class="ui header" block-content="content"></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/header.css'
	]
};

