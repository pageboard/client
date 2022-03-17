exports.video = {
	title: "Vidéo",
	priority: 1,
	menu: 'media',
	icon: '<i class="icon video"></i>',
	group: "block",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
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
					type: ["video"]
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
		muted: {
			title: 'Muted',
			type: 'boolean',
			default: false
		},
		loop: {
			title: 'Loop',
			type: 'boolean',
			default: false
		},
		display: {
			title: "Display",
			type: "object",
			properties: {
				fit: {
					title: "Fit",
					default: "contain",
					anyOf: [{
						title: "contain",
						const: "contain"
					}, {
						title: "cover",
						const: "cover"
					}, {
						title: "natural",
						const: "none"
					}]
				}
			}
		}
	},
	html: `<video is="element-video" data-src="[url]" class="[display.fit|or:none]"
		preload="metadata" autoplay="[autoplay]" loop="[loop]"
		muted="[muted]" controls="[controls]"></video>`,
	scripts: [
		'../ui/media.js'
	],
	stylesheets: [
		'../ui/media.css'
	],
	csp: {
		media: ["'self'"]
	}
};

exports.audio = {
	title: "Audio",
	priority: 1,
	menu: 'media',
	icon: '<i class="icon music"></i>',
	group: "block",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
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
	html: `<audio is="element-audio" data-src="[url]"
		preload="metadata" autoplay="[autoplay]" loop="[loop]" controls="[controls]"></audio>`,
	scripts: [
		'../ui/media.js'
	],
	stylesheets: [
		'../ui/media.css'
	],
	csp: {
		media: ["'self'"]
	}
};

