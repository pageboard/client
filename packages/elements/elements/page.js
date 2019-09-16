exports.page = {
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
	contents: {
		body: {
			spec: 'block+',
			title: 'body'
		}
	},
	html: `<html lang="[$site.lang|ornull]">
	<head>
		<title>[title][$site.title|pre: - |or:]</title>
		<meta http-equiv="Status" content="[$status|or:200] [$statusText|or:OK][redirect|!|bmagnet:*]">
		<meta http-equiv="Status" content="301 Moved Permanently[transition.from|!|bmagnet:*+]">
		<meta http-equiv="Location" content="[redirect|eq:[url]:|ornull|magnet:+*]">
		<meta http-equiv="Status" content="302 Found">
		<meta http-equiv="Location" content="[$links.found|ornull|magnet:+*]">
		<meta http-equiv="Content-Security-Policy" content="[$elements|csp]">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="robots" content="[noindex|?|ornull|magnet:*]">
		<meta name="description" content="[description|magnet:*]">
		<base href="[$loc.protocol]//[$loc.host]">
		<link rel="icon" href="[$site.favicon|magnet:*|url]?format=ico">
		<link rel="canonical" href="[$loc.pathname][$loc.search][noindex|!|bmagnet:*]">
		<link rel="stylesheet" href="[$element.stylesheets|repeat]">
		<script crossorigin="anonymous" defer src="https://cdn.polyfill.io/v3/polyfill.min.js?flags=gated&unknown=polyfill&features=[$elements|polyfills|url|magnet:*]"></script>
		<script defer src="[$element.scripts|repeat]"></script>
	</head>
	<body block-content="body"></body></html>`,
	scripts: [
		'../lib/custom-elements.js',
		'../lib/custom-elements-builtin.js'
	].concat(exports.site.resources),
	polyfills: [
		'default', 'dataset', 'fetch', 'es2015', 'es2016', 'URL'
	],
	filters: {
		polyfills: function($elements, what) {
			var map = {};
			Object.keys($elements).forEach(function(key) {
				var list = $elements[key].polyfills;
				if (!list) return;
				if (typeof list == "string") list = [list];
				list.forEach(function(item) {
					// what.scope from matchdom is not like scope from pageboard
					item = item.fuse({}, what.scope.data);
					map[item] = true;
				});
			});
			return Object.keys(map).join(',');
		},
		csp: function($elements, what) {
			var csp = {};
			Object.keys($elements).forEach(function(key) {
				var ecsp = $elements[key].csp;
				if (!ecsp) return;
				Object.keys(ecsp).forEach(function(src) {
					var gcsp = csp[src];
					if (!gcsp) csp[src] = gcsp = [];
					var list = ecsp[src];
					if (!list) return;
					if (typeof list == "string") list = [list];
					list.forEach(function(val) {
						if (gcsp.includes(val) == false) gcsp.push(val);
					});
				});
			});
			return Object.keys(csp).filter(function(src) {
				return csp[src].length > 0;
			}).map(function(src) {
				var key = src.indexOf('-') > 0 ? src : `${src}-src`;
				return `${key} ${csp[src].join(' ')}`.trim();
			}).join('; ');
		}
	},
	csp: {
		default: ["'none'"],
		'block-all-mixed-content': [""],
		'form-action': ["'self'"],
		'base-uri': ["'self'"],
		connect: ["'self'"],
		object: ["'none'"],
		script: ["'self'", "https://cdn.polyfill.io"],
		frame: ["https:"],
		style: ["'self'", "'unsafe-inline'"],
		font: ["'self'", "data:"],
		img: ["'self'", "data:"]
	}
};

exports.redirection = {
	priority: -100,
	replaces: 'doc',
	title: 'Redirection',
	icon: '<i class="icon random"></i>',
	group: 'page',
	standalone: true,
	properties: {
		url: {
			title: 'Address',
			type: "string",
			pattern: "^((/[a-zA-Z0-9-]*)+)$|^(/\\.well-known/\\d{3})$",
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
	<body>Redirecting to <a href="[redirect]">[redirect]</a></body>
	</html>`
};

