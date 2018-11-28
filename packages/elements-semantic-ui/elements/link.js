Pageboard.elements.link = {
	priority: 11,
	title: "Link",
	icon: '<i class="icon linkify"></i>',
	properties: {
		button: {
			title: 'Button',
			description: 'Show link as button',
			type: 'boolean',
			default: false
		},
		url: {
			title: 'Address',
			description: 'Path without query or full url',
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
		template: {
			title: 'Template',
			description: 'Query template',
			type: 'string',
			context: 'query|form'
		},
		icon: { // TODO remove me in favor of inline images
			title: 'Icon',
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
	contents: {
		text: "text*"
	},
	inline: true,
	group: "inline",
	tag: 'a:not(.itemlink)',
	auto: function(a, hrefs) {
		if (a.hostname && a.hostname != document.location.hostname) {
			a.target = "_blank";
			a.rel = "noopener";
		} else if (a.pathname && a.pathname.startsWith('/.')) {
			a.target = "_blank";
		} else if (a.href) {
			var href = a.getAttribute('href').split('?')[0];
			var meta = (hrefs || {})[href];
			if (meta && meta.mime && meta.mime.startsWith("text/html") == false) {
				a.target = "_blank";
			}
		}
		return a;
	},
	html: '<a href="[url]" class="[button|?:ui button] [icon|?]" data-href="[template]"></a>',
	fuse: function(node, d, scope) {
		if (d.icon) node.style.backgroundImage = `url(${d.icon})`;
		return this.auto(node.fuse(d, scope), scope.$hrefs);
	},
	stylesheets: [
		'../semantic-ui/button.css'
	]
};

