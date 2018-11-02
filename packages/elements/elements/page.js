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
			anyOf: [{
				type: "null"
			}, {
				type: "string",
				format: "singleline"
			}],
			$helper: 'pageTitle'
		},
		description: {
			title: 'Description',
			type: ['string', 'null']
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "^(/[a-zA-Z0-9-]*)+$",
			$helper: 'pageUrl' // works with sitemap editor to update pages url in a coherent manner
			// see also page.save: the href updater will only change input.name == "href".
		},
		redirect: {
			title: 'Redirect',
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
		<title>[$site.title|post:%3A |][title]</title>
		<meta http-equiv="Status" content="404 Not Found[url|!|bmagnet:*]">
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
		'../lib/window-page.js',
		'../lib/pageboard.js'
	],
	polyfills: [
		'dataset', 'fetch'
	]
};

// extend page
Pageboard.elements.notfound = Object.assign({}, Pageboard.elements.page, {
	title: 'Page not found',
	properties: Object.assign({}, Pageboard.elements.page.properties)
});
delete Pageboard.elements.notfound.properties.url;

