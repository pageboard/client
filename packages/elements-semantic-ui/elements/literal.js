Pageboard.elements.literal = {
	title: "Literal",
	properties: {
		code: {
			title: 'Javascript accessor',
			description: 'A global variable to access',
			type: "string",
			pattern: "((^|\.)[a-zA-Z0-9_]+)+$"
		}
	},
	inline: true,
	icon: '<b class="icon">${...}</b>',
	render: function(doc, block) {
		return doc.dom`<code class="literal">${block.data.code || 'uninitialized literal'}</code>`;
	},
	foreign: function(dom, block) {
		if (block.data.code == null) return;
		var result = "";
		try {
			result = eval(block.data.code);
		} catch(ex) {
			return;
		}
		dom.textContent = result;
	}
};

