Pageboard.elements.site = {
	priority: -1000,
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

Pageboard.elements.page = {
	priority: -100,
	replaces: 'doc',
	title: 'Page',
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	standalone: true, // besides site, can be child of zero or more parents
	properties: {
		title: {
			title: 'Title',
			nullable: true,
			type: "string",
			format: "singleline",
			$helper: 'pageTitle'
		},
		description: {
			title: 'Description',
			nullable: true,
			type: 'string'
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "^((/[a-zA-Z0-9-]*)+)$|^(/\\.well-known/\\d{3})$",
			$helper: 'pageUrl' // works with sitemap editor to update pages url in a coherent manner
			// see also page.save: the href updater will only change input.name == "href".
		},
		redirect: {
			title: 'Redirect',
			anyOf: [{
				type: "string",
				format: "uri",
				nullable: true
			}, {
				type: "string",
				format: "pathname",
				nullable: true
			}],
			$helper: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
		index: {
			type: "integer",
			default: 0,
			minimum: 0
		},
		noindex: {
			title: 'Block search engine indexing',
			type: 'boolean',
			default: false
		},
		nositemap: {
			title: 'Do not show in sitemap',
			type: 'boolean',
			default: false
		}
	},
	contents: {
		body: {
			spec: 'block+',
			title: 'body'
		}
	},
	html: `<html lang="[$site.lang]">
	<head>
		<title>[title][$site.title|pre: - |or:]</title>
		<meta http-equiv="Status" content="[$status|or:200] [$statusText|or:OK][redirect|!|bmagnet:*]">
		<meta http-equiv="Status" content="302 Found[transition.from|!|bmagnet:*+]">
		<meta http-equiv="Location" content="[redirect|eq:[url]:|magnet:+*]">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="robots" content="[noindex|bmagnet:*|?]">
		<meta name="description" content="[description|magnet:*]">
		<link rel="icon" href="[$site.favicon|magnet:*|url]?format=ico">
		<link rel="stylesheet" href="[$element.stylesheets|repeat]" />
		<script defer src="[$element.scripts|repeat]"></script>
	</head>
	<body block-content="body"></body></html>`,
	scripts: [
		'../lib/custom-elements.js',
		'../lib/custom-elements-builtin.js'
	].concat(Pageboard.elements.site.resources),
	polyfills: [
		'dataset', 'fetch'
	]
};


