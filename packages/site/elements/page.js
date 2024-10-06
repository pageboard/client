exports.page = {
	priority: -100,
	title: 'Page',
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	required: ['url'],
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
			format: 'page',
			$helper: 'pageUrl' // works with sitemap editor to update pages url in a coherent manner
			// see also page.save: the href updater will only change input.name == "href".
		},
		redirect: {
			title: 'Redirect',
			type: "string",
			format: "uri-reference",
			nullable: true,
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
		},
		keywords: {
			title: 'Keywords',
			type: 'array',
			items: {
				type: 'string'
			},
			nullable: true
		}
	},
	contents: [{
		nodes: 'header? main+ footer?',
		id: 'body'
	}],
	html: `<html lang="[$site.lang|ornull]">
	<head>
		<title>[title][$site.title|pre: - |or:]</title>
		<meta http-equiv="Status" content="[$status|or:200] [$statusText|or:OK][redirect|!|bmagnet:*]">
		<meta http-equiv="Status" content="301 Moved Permanently[transition.from|!|bmagnet:*+]">
		<meta http-equiv="Location" content="[redirect|eq:[url]:|ornull|magnet:+*][$loc.search]">
		<meta http-equiv="Status" content="301 Matching Location">
		<meta http-equiv="Location" content="[$links.found|ornull|magnet:+*]">
		<meta http-equiv="Content-Security-Policy" content="[$elements|csp]">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="robots" content="[noindex|?|ornull|magnet:*]">
		<meta name="description" content="[description|magnet:*]">
		<base href="[$loc.origin]">
		<link rel="canonical" href="[$loc.origin][$loc.pathname][$loc.search][noindex|!|bmagnet:*]">
		<link rel="icon" href="[$site.favicon|post:?format=ico|or:data%3A,]">
		<link rel="stylesheet" href="[$element.stylesheets|repeat]">
		<script crossorigin="anonymous" defer src="https://cdnjs.cloudflare.com/polyfill/v3/polyfill.min.js?flags=gated&unknown=polyfill&features=[$elements|polyfills|url|magnet:*]"></script>
		<script defer src="[$element.scripts|repeat]"></script>
	</head>
	<body block-content="body"></body></html>`,
	scripts: [
		'../lib/custom-elements.js'
	].concat(exports.site.scripts).concat([
		'../ui/nav.js'
	]),
	polyfills: [
		'default',
		'Element.prototype.dataset',
		'fetch',
		'es2015', 'es2016', 'es2017', 'es2018',
		'URL',
		`Intl.~locale.[$site.lang|or:en]`,
		'smoothscroll'
	],
	csp: {
		default: ["'none'"],
		'block-all-mixed-content': [""],
		'form-action': ["'self'"],
		connect: ["'self'"],
		object: ["'none'"],
		script: ["'self'", "https://cdnjs.cloudflare.com"],
		frame: ["https:"],
		style: ["'self'", "'unsafe-inline'"],
		font: ["'self'", "data:", "https:"],
		img: ["'self'", "data:", "https:"]
	}
};

exports.redirection = {
	priority: -100,
	title: 'Redirection',
	icon: '<i class="icon random"></i>',
	group: 'page',
	required: ['url'],
	properties: {
		url: {
			title: 'Address',
			type: "string",
			format: "page",
			$helper: 'pageUrl' // works with sitemap editor to update pages url in a coherent manner
			// see also page.save: the href updater will only change input.name == "href".
		},
		redirect: {
			title: 'Redirect',
			type: "string",
			format: "uri-reference",
			nullable: true,
			$helper: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
	},
	html: `<html>
	<head>
		<meta http-equiv="Status" content="301 Moved Permanently">
		<meta http-equiv="Location" content="[redirect]">
	</head>
	<body>
		Redirecting to <br>
		<a href="[redirect]">[redirect]</a>
	</body>
	</html>`
};

