exports.audio = {
	title: "Audio",
	menu: 'media',
	icon: '<i class="icon audio"></i>',
	group: "block",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
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
					type: ["audio"]
				}
			}
		},
		autoplay: {
			title: 'Autoplay',
			type: 'boolean',
			default: false
		},
		controls: {
			title: 'Show controls',
			type: 'boolean',
			default: false
		},
		loop: {
			title: 'Loop',
			type: 'boolean',
			default: false
		}
	},
	html: `<audio is="element-audio"
		preload="metadata" autoplay="[autoplay]" loop="[loop]" controls="[controls]"></audio>`,
	scripts: [
		'../ui/audio.js'
	],
	csp: {
		media: ["'self'"]
	}
};

