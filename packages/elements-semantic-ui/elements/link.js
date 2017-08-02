Pageboard.elements.link = {
	title: "Link",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri"
		},
		target: {
			title: 'Target',
			description: 'Choose how to open link',
			default: "",
			oneOf: [{
				constant: "",
				title: "auto target"
			}, {
				constant: "_blank",
				title: "new window"
			}, {
				constant: "_self",
				title: "same window"
			}]
		}
	},
	contents: {
		text: {
			spec: "text*",
			title: 'inline content'
		}
	},
	inline: true,
	group: "inline",
	icon: '<i class="icon linkify"></i>',
	render: function(doc, block) {
		return doc.dom`<a block-content="text" href="${block.data.url}" target="${block.data.target}"></a>`;
	}
};

