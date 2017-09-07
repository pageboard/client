Pageboard.elements.link = {
	title: "Link",
	priority: 11,
	properties: {
		target: {
			title: 'Target window',
			description: 'Choose how to open link',
			default: "",
			oneOf: [{
				constant: "",
				title: "auto"
			}, {
				constant: "_blank",
				title: "new"
			}, {
				constant: "_self",
				title: "same"
			}]
		},
		button: {
			title: 'Button',
			description: 'Show link as button',
			type: 'boolean',
			default: false
		},
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				media: ["link", "file", "archive"]
			}
		}
	},
	contents: {
		text: "text*"
	},
	context: "paragraph/",
	inline: true,
	group: "inline",
	icon: '<i class="icon linkify"></i>',
	render: function(doc, block) {
		var a = doc.dom`<a href="${block.data.url}"></a>`;
		if (a.hostname != document.location.hostname) a.rel = "noopener";
		if (block.data.target) a.target = block.data.target;
		if (block.data.button) a.className = "ui button";
		return a;
	},
	stylesheets: ['/.pageboard/semantic-ui/components/button.css']
};

