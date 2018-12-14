Pageboard.elements.link = {
	priority: 11,
	title: "Link",
	icon: '<i class="icon linkify"></i>',
	properties: {
		button: {
			title: 'Button',
			description: 'Show link as button',
			type: 'boolean',
			default: false
		},
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
	group: "inline",
	tag: 'a:not(.itemlink)',
	html: '<a href="[url|autolink]" class="[button|?:ui button]"></a>',
	stylesheets: [
		'../lib/components/button.css'
	]
};

