Pageboard.elements.strong = {
	title: "Strong",
	properties: {},
	contents: "text*",
	inplace: true,
	inline: true,
	group: "inline",
	icon: '<i class="icon bold"></i>',
	render: function(doc, block) {
		return doc.dom`<strong></strong>`;
	}
};

Pageboard.elements.em = {
	title: "Emphasize",
	properties: {},
	contents: "text*",
	inline: true,
	inplace: true,
	group: "inline",
	icon: '<i class="icon italic"></i>',
	render: function(doc, block) {
		return doc.dom`<em></em>`;
	}
};
