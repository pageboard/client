Pageboard.elements.gallery = {
	title: "Gallery",
	menu: "widget",
	priority: 20,
	properties: {
		showMenu: {
			type: 'boolean',
			default: true,
			title: 'Show menu'
		}
	},
	contents: {
		galleries: {
			spec: "(portfolio medialist carousel)|(portfolio|medialist|carousel)+"
		}
	},
	group: 'block',
	icon: '<i class="university icon"></i>',
	render: function(doc, block, view) {
		var d = block.data;
		return doc.dom`<element-gallery data-show-menu="${d.showMenu}">
			<div block-content="galleries"></div>
		</element-gallery>`;
	},
	stylesheets: [
		'../ui/gallery.css'
	],
	scripts: [
		'../ui/gallery.js'
	],
	helpers: [
		'../ui/dift.js',
		'../ui/gallery-helper.js'
	]
};

Pageboard.elements.itemlink = {
	title: "Item Link",
	menu: "widget",
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
		url: {
			title: 'Address',
			description: 'Local or remote URL',
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
		icon: {
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
		text: {
			spec: "(paragraph|heading|image)+"
		}
	},
	icon: '<i class="icon linkify"></i>',
	render: function(doc, block) {
		var a = doc.dom`<a class="itemlink" href="${block.data.url}" block-content="text"></a>`;
		if (a.hostname != document.location.hostname) a.rel = "noopener";
		var d = block.data;
		if (d.target) a.target = d.target;
		if (d.icon) {
			a.classList.add('icon');
			a.style.backgroundImage = `url(${d.icon})`;
		}
		return a;
	}
};
