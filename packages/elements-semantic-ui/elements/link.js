Pageboard.elements.link = {
	title: "Link",
	priority: 11,
	properties: {
		target: {
			title: 'Target window',
			description: 'Choose how to open link',
			default: "",
			oneOf: [{
				const: "",
				title: "auto"
			}, {
				const: "_blank",
				title: "new"
			}, {
				const: "_self",
				title: "same"
			}]
		},
		button: {
			title: 'Button',
			description: 'Show link as button',
			type: 'boolean',
			default: false
		},
		url: {
			title: 'Address',
			description: 'Path without query or full url',
			oneOf: [{
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
			oneOf: [{
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
	render: function(doc, block) {
		var d = block.data;
		var a = doc.dom`<a href="${d.url}"></a>`;
		if (a.hostname != document.location.hostname) a.rel = "noopener";
		if (d.target) a.target = d.target;
		if (d.button) a.className = "ui button";
		if (d.icon) {
			a.classList.add('icon');
			a.style.backgroundImage = `url(${d.icon})`;
		}
		if (d.template) a.setAttribute('attr-href', d.template);
		return a;
	},
	stylesheets: [
		'../semantic-ui/button.css'
	]
};

