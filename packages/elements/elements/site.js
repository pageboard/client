Pageboard.elements.site = {
	standalone: true,
	properties : {
		title: {
			title: 'Site title',
			nullable: true,
			type: "string"
		},
		domains: {
			title: 'Domain names',
			description: 'The main domain and the redirecting ones if any',
			nullable: true,
			type: "array",
			items: {
				type: "string",
				format: 'hostname'
			}
		},
		author: {
			title: 'Author',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		license: {
			title: 'License',
			nullable: true,
			type: "string",
			format: "singleline"
			// TODO use spdx.org/licenses for choosing a license
		},
		lang: {
			title: 'Language',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		module: {
			title: 'Module name',
			nullable: true,
			type: "string",
			format: "singleline"
		},
		version: {
			title: 'Module version',
			description: 'Semantic version or git tag or commit',
			nullable: true,
			type: "string",
			format: "singleline" // a "version" format ?
		},
		server: {
			title: 'Server',
			anyOf: [{
				const: "stable",
				title: "Stable"
			}, {
				const: "latest",
				title: "Latest"
			}],
			default: "latest"
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
			nullable: true,
			type: "string",
			format: "pathname",
			$helper: {
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
		"../lib/pageboard.js",
		"../ui/route.js"
	]
};

