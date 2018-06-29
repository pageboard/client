Pageboard.elements.mail_link = {
	title: "Link",
	priority: 11,
	properties: {
		url: {
			title: 'Address',
			description: 'Path without query or full url',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "uri"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
		template: {
			title: 'Template',
			description: 'Query template',
			type: 'string',
			context: 'mail_query'
		}
	},
	contents: {
		text: "text*"
	},
	inline: true,
	group: "mail_inline",
	icon: '<i class="icon linkify"></i>',
	render: function(doc, block) {
		var d = block.data;
		var a = doc.dom`<a href="${d.url}"></a>`;
		if (d.template) a.dataset.href = d.template;
		return a;
	}
};

