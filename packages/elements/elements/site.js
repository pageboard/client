Pageboard.elements.site = {
	properties : {
		title: {
			title: 'Site title',
			anyOf: [{type: "null"}, {type: "string"}]
		},
		domains: {
			title: 'Domain names',
			description: 'The main domain and the redirecting ones if any',
			type: "array",
			items: {
				type: "string",
				format: 'hostname'
			},
			default: []
		},
		lang: {
			title: 'Language',
			anyOf: [{type: "null"}, {type: "string"}]
		},
		module: {
			title: 'Module name',
			anyOf: [{type: "null"}, {type: "string"}]
		},
		version: {
			title: 'Module version',
			description: 'Semantic version or git tag or commit',
			anyOf: [{
				type: "null"
			}, {
				type: "string" // TODO patterns, see core
			}]
		},
		env: {
			title: 'Environment',
			anyOf: [{
				const: 'dev',
				title: 'Development'
			}, {
				const: 'staging',
				title: 'Staging'
			}, {
				const: 'production',
				title: 'Production'
			}],
			default: 'dev'
		},
		favicon: {
			title: 'Favicon',
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
				name: 'href',
				display: 'icon',
				filter: {
					type: ["image", "svg"],
					maxSize: 20000,
					maxWidth: 320,
					maxHeight: 320
				}
			}
		}
	},
	resources: [
		"../lib/window-page.js",
		"../lib/dom-template-strings.js",
		"../lib/viewer.js",
		"../ui/route.js"
	]
};

