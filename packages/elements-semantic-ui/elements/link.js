Pageboard.elements.link = {
	title: "Link",
	priority: 11,
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
				pattern: "^(/[\\w-.]*)+$"
			}],
			input: {
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
	contents: {
		text: "text*"
	},
	inline: true,
	group: "inline",
	tag: 'a:not(.itemlink)',
	icon: '<i class="icon linkify"></i>',
	auto: function(a) {
		if (a.hostname && a.hostname != document.location.hostname) {
			a.target = "_blank";
			a.rel = "noopener";
		} else if (a.pathname && a.pathname.startsWith('/.')) {
			a.target = "_blank";
		} else {
			var href = a.getAttribute('href').split('?')[0];
			var meta = Pageboard.hrefs[href];
			if (meta && meta.mime && meta.mime.startsWith("text/html") == false) {
				a.target = "_blank";
			}
		}
		return a;
	},
	render: function(doc, block) {
		var d = block.data;
		var a = this.auto(doc.dom`<a href="${d.url}"></a>`);
		if (d.button) a.className = "ui button";
		if (d.icon) {
			a.classList.add('icon');
			a.style.backgroundImage = `url(${d.icon})`;
		}
		if (d.template) a.dataset.href = d.template;
		return a;
	},
	stylesheets: [
		'../semantic-ui/button.css'
	]
};

