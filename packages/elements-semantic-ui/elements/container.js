Pageboard.elements.container = {
	title: "Container",
	properties: {},
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	menu: 'layout',
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
	properties: {},
	contents: {
		content: {
			spec: "block+",
			title: 'content'
		}
	},
	menu: 'layout',
	group: 'block',
	icon: '<i class="icon resize vertical"></i>',
	render: function(doc, block) {
		return doc.dom`<div class="maximize" block-content="content"></div>`;
	},
	stylesheets: [
		'ui/maximize.css'
	]
};

