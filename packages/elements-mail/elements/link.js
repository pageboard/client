Pageboard.elements.mail_link = {
	priority: 11,
	title: "Link",
	icon: '<i class="icon linkify"></i>',
	properties: {
		url: {
			title: 'Address',
			description: 'Path without query or full url',
			nullable: true,
			anyOf: [{
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
		}
	},
	contents: {
		text: "text*"
	},
	inline: true,
	group: "mail_inline",
	html: '<a href="[url]"></a>'
};

