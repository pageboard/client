Pageboard.elements.gallery = {
	priority: 20,
	title: "Gallery",
	icon: '<i class="university icon"></i>',
	menu: "widget",
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
	html: `<element-gallery data-show-menu="[showMenu]">
		<div block-content="galleries"></div>
	</element-gallery>`,
	resources: [
		'../lib/list-diff.js',
		'../ui/gallery-helper.js'
	],
	stylesheets: [
		'../ui/gallery.css'
	],
	scripts: [
		'../ui/gallery.js'
	],
	install: function(doc, page, scope) {
		if (scope.$write) this.scripts = this.resources;
	}
};

Pageboard.elements.itemlink = {
	priority: 10,
	title: "Item Link",
	icon: '<i class="icon linkify"></i>',
	menu: "widget",
	group: 'blocklink',
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
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
		icon: {
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
		text: {
			spec: "(paragraph_nolink|heading|image)+"
		}
	},
	html: '<a class="itemlink [icon|?]" style="background-image:url([icon|magnet])" href="[url]" block-content="text"></a>',
	fuse: function(node, d, scope) {
		Pageboard.elements.link.auto(node.fuse(d), scope.$hrefs);
	}
};
