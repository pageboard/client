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
			description: 'Local or remote URL',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		},
		icon: {
			title: 'Icon',
			type: "string",
			format: "uri",
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
	context: "paragraph/",
	inline: true,
	group: "inline",
	icon: '<i class="icon linkify"></i>',
	render: function(doc, block) {
		var a = doc.dom`<a href="${block.data.url}"></a>`;
		if (a.hostname != document.location.hostname) a.rel = "noopener";
		var d = block.data;
		if (d.target) a.target = d.target;
		if (d.button) a.className = "ui button";
		if (d.icon) {
			a.classList.add('icon');
			a.style.backgroundImage = `url(${d.icon})`;
		}
		return a;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/button.css'
	]
};

