Pageboard.elements.mail_link = {
	priority: 11,
	title: "Link",
	icon: '<i class="icon linkify"></i>',
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
				format: "pathname"
			}],
			$helper: {
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
	html: '<a href="[url]" data-href="[template]"></a>'
};

