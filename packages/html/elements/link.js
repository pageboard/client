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
		},
		id: {
			title: 'Link name',
			description: 'Target for anchors',
			nullable: true,
			type: 'string',
			format: 'grant'
		},
	},
	contents: "text*",
	inline: true,
	group: "inline",
	tag: 'a:not([block-type]),a[block-type="link"]',
	html: '<a href="[url|lang:[lang]]" hreflang="[lang]" class="[button|alt:ui button]" id="[id]"></a>',
	stylesheets: [
		'../ui/components/button.css'
	]
};

exports.link_button = {
	title: "Link Btn",
	priority: 11,
	icon: '<i class="icons"><i class="linkify icon"></i><i class="corner hand pointer icon"></i></i>',
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
		},
		full: {
			title: 'Fluid',
			type: 'boolean',
			default: false
		},
		icon: {
			title: 'Icon',
			type: 'boolean',
			default: false
		},
		compact: {
			title: 'Compact',
			type: 'boolean',
			default: false
		},
		float: {
			title: 'Float',
			anyOf: [{
				type: 'null',
				title: 'No'
			}, {
				const: 'left',
				title: 'Left'
			}, {
				const: 'right',
				title: 'Right'
			}],
			default: null
		}
	},
	contents: "text*",
	group: "block",
	html: '<a href="[url|lang:[lang]]" hreflang="[lang]" class="ui [full|alt:fluid:] [icon] [compact] [float|post:%20floated] button"></a>',
	stylesheets: [
		'../ui/components/button.css'
	]
};
