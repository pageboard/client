Pageboard.elements.code = {
	title: "Literal",
	inline: true,
	inplace: true,
	icon: '<b class="icon">"</b>',
	render: function(doc, block) {
		return doc.dom`<code></code>`;
	}
};

