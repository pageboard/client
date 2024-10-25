exports.page = {
	title: 'Page',
	priority: -100,
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	dependencies: ['core'],
	bundle: true,
	standalone: true,
	required: ['url'],
	properties: {
		url: {
			type: "string",
			format: 'page',
			$helper: 'href',
			$filter: {
				name: 'helper',
				helper: 'pageUrl'
			}
		},
		prefix: {
			title: 'Match by prefix',
			description: `Match all url having this prefix, unless an actual page exists.`,
			type: "boolean",
			nullable: true
		},
		redirect: {
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
		}
	},
	contents: [{
		title: 'Title',
		id: 'title'
	}, {
		title: 'Description',
		id: 'description'
	}, {
		nodes: 'header? main+ footer?',
		id: 'body'
	}],
	html: `<html lang="[$lang]">
	<head>
		<title>[$content.title][$parent.data.title?|pre: - ]</title>
		<meta http-equiv="Status" content="[$status|or:200] [$statusText|or:OK][redirect|not:prune:*]">
		<meta http-equiv="Status" content="301 Moved Permanently[transition.from|not:prune:*:1]">
		<meta http-equiv="Location" content="[redirect|switch:[url]:|fail:*::1][$loc.search]">
		<meta http-equiv="Status" content="301 Matching Location">
		<meta http-equiv="Location" content="[$links?.found|fail:*::1]">
		<meta http-equiv="Content-Security-Policy" content="[$elements|as:csp]">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="robots" content="[noindex|fail:*]">
		<meta name="description" content="[$content.description|fail:*]">
		<base href="[$loc.origin]">
		<link rel="canonical" href="[$loc.origin][$loc.pathname][$loc.search][noindex|not:prune:*::1]">
		<link rel="alternate" hreflang="[$parent.data.languages|repeat:lang]" href="[$loc.origin][$loc.pathname|lang:[lang]][$loc.search]">
		<link rel="icon" href="[$parent.data.favicon|post:?format=ico|or:data%3A,]">
		<link rel="stylesheet" href="[$element.stylesheets|repeat:]" data-priority="[$element.priority]">
		<script defer src="[$element.scripts|repeat:]" data-priority="[$element.priority]"></script>
	</head>
	<body block-content="body"></body></html>`,
	scripts: [
		'../ui/nav.js'
	],
	stylesheets: [
		'../ui/nav.css'
	],
	polyfills: [
		'default',
		'customElementsBuiltin',
		'Element.prototype.dataset',
		'fetch',
		'URL',
		'es2015', 'es2016', 'es2017', 'es2018',
		'Intl.NumberFormat.~locale.*',
		'Intl.DateTimeFormat.~locale.*',
		'Intl.RelativeTimeFormat.~locale.*',
		'console.debug',
		'smoothscroll'
	],
	csp: {
		default: ["'none'"],
		'form-action': ["'self'"],
		connect: ["'self'"],
		object: ["'none'"],
		script: ["'self'"],
		frame: ["https:"],
		style: ["'self'", "'unsafe-inline'"],
		font: ["'self'", "data:", "https:"],
		img: ["'self'", "data:", "https:"]
	}
};

exports.redirection = {
	title: 'Redirection',
	priority: -100,
	icon: '<i class="icon random"></i>',
	dependencies: ['core'],
	bundle: true,
	standalone: true,
	group: 'page',
	required: ['url'],
	properties: {
		url: {
			title: 'Address',
			type: "string",
			format: "page",
			$helper: 'href',
			$filter: {
				name: 'helper',
				helper: 'pageUrl'
			}
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

