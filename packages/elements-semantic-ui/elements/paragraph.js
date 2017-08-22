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

