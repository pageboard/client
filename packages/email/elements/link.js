exports.mail_link = {
	title: "Link",
	priority: 11,
	icon: '<i class="icon linkify"></i>',
	properties: {
		url: {
			title: 'Address',
			description: 'Path without query or full url',
			nullable: true,
			type: 'string',
			format: 'uri-reference',
			$helper: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
		lang: {
			title: 'Language',
			type: 'string',
			format: 'lang',
			nullable: true,
			$helper: {
				name: 'datalist',
				url: '/.api/languages'
			}
		}
	},
	contents: "text*",
	inline: true,
	group: "mail_inline",
	html: '<a href="[url|lang:[lang]]" hreflang="[lang]"></a>'
};

