exports.attachment = {
	title: "Attach",
	icon: '<i class="icon file"></i>',
	properties: {
		filename: {
			title: 'File name',
			type: 'string',
			format: 'singleline'
		},
		href: {
			title: 'URL',
			type: 'string',
			format: 'uri-reference',
			$helper: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		}
	},
	contents: "text*",
	inline: true,
	group: "mail_inline",
	html: '<a href="[href]" download="[filename]"></a>'
};

