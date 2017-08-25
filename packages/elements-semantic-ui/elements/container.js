Pageboard.elements.container = {
	title: "Container",
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	icon: '<i class="icon resize horizontal"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="ui container" block-content="content"></div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/container.css'
	]
};

Pageboard.elements.maximize = {
	title: "Maximize",
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	group: 'block',
	icon: '<i class="icon resize vertical"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="maximize" block-content="content"></div>`;
	},
	stylesheets: [
		'../ui/maximize.css'
	]
};

