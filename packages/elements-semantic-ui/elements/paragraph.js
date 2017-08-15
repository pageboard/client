Pageboard.elements.paragraph = {
	title: "Paragraph",
	generic: true, // means it is matched against nodeName, not block-type attribute
	priority: -10,
	properties: {},
	contents: {
		text: {
			spec: "inline<_>*",
			title: 'Text'
		}
	},
	group: "block",
	icon: '<i class="icon paragraph"></i>',
	render: function(doc, block) {
		return doc.dom`<p block-content="text"></p>`;
	}
};

