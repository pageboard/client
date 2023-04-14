exports.page = {
	priority: -100,
	title: 'Page',
	icon: '<i class="icon file outline"></i>',
	group: 'page',
	bundle: true,
	dependencies: ['core'],
	standalone: true,
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
			$helper: 'href',
			$filter: {
				name: 'helper',
				helper: 'pageUrl'
			}
		},
		prefix: {
			title: 'Match by prefix',
			description: `Match all url having this prefix, unless an actual page exist.`,
			type: "boolean",
			nullable: true
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
		},
		dictionary: {
			title: 'Dictionary',
			type: 'string',
			format: 'id',
			nullable: true
		}
	},
	contents: [{
		nodes: 'header? main+ footer?',
		id: 'body'
	}],
	html: `<html lang="[$lang]">
	<head>
		<title>[title][$site.title?|pre: - ]</title>
		<meta http-equiv="Status" content="[$status|or:200] [$statusText|or:OK][redirect|prune:*]">
		<meta http-equiv="Status" content="301 Moved Permanently[transition.from|prune:*:1]">
		<meta http-equiv="Location" content="[redirect|neq:[url]|fail:*::1][$loc.search]">
		<meta http-equiv="Status" content="301 Matching Location">
		<meta http-equiv="Location" content="[$links.found|fail:*::1]">
		<meta http-equiv="Content-Security-Policy" content="[$elements|as:csp]">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="robots" content="[noindex|and:noindex|fail:*]">
		<meta name="description" content="[description|fail:*]">
		<base href="[$loc.origin]">
		<link rel="canonical" href="[$loc.origin][$loc.pathname][$loc.search][noindex|prune:*]">
		<link rel="icon" href="[$site.favicon|post:?format=ico|or:data%3A,]">
		<link rel="stylesheet" href="[$element.stylesheets|repeat:]" data-priority="[$element.priority]">
		<script crossorigin="anonymous" defer src="https://cdn.polyfill.io/v3/polyfill.min.js?flags=gated&unknown=polyfill&features=[$elements|as:polyfills|enc:url|fail:*]" data-priority="-10000"></script>
		<script defer src="[$element.scripts|repeat:]" data-priority="[$element.priority]"></script>
	</head>
	<body block-content="body"></body></html>`,
	scripts: [
		'../ui/nav.js'
	],
	polyfills: [
		'default',
		'Element.prototype.dataset',
		'fetch',
		'es2015', 'es2016', 'es2017', 'es2018',
		'Intl.NumberFormat.~locale.[$lang]',
		`Intl.DateTimeFormat.~locale.[$lang]`,
		'console.debug',
		'smoothscroll'
	],
	csp: {
		default: ["'none'"],
		'form-action': ["'self'"],
		connect: ["'self'"],
		object: ["'none'"],
		script: ["'self'", "https://cdn.polyfill.io"],
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
