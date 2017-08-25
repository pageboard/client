Pageboard.elements.header = {
	title: "Header",
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	render: function(doc, block) {
		return doc.dom`<div class="ui header" block-content="content"></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/header.css'
	]
};

