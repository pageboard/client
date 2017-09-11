Pageboard.elements.paragraph = {
	title: "Paragraph",
	priority: -10,
	properties: {},
	contents: "inline<_>*",
	group: "block",
	inplace: true,
	icon: '<i class="icon paragraph"></i>',
	render: function(doc, block) {
		return doc.dom`<p></p>`;
	}
};

Pageboard.elements.heading = {
	title: "Heading",
	properties: {
		level: {
			title: 'Level',
			description: 'Between 1 and 6',
			type: "integer",
			default: 1,
			minimum: 1,
			maximum: 6
		}
	},
	contents: {
		"text": "inline<_>*"
	},
	group: "block",
//	inplace: true,
	icon: '<i class="icon header"></i>',
	tag: 'h1,h2,h3,h4,h5,h6',
	parse: function(dom) {
		var level = parseInt(dom.nodeName.substring(1));
		return {level: level};
	},
	render: function(doc, block) {
		var node = doc.createElement('h' + block.data.level);
		node.setAttribute('block-content', 'text');
		return node;
	}
};
