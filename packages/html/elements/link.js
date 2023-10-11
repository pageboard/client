exports.link = {
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
	group: "inline",
	tag: 'a:not([block-type]),a[block-type="link"]',
	html: '<a href="[url][lang|pre:.]" hreflang="[lang]" class="[button|alt:ui button]"></a>',
	stylesheets: [
		'../lib/components/button.css'
	]
};

