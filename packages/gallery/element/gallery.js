exports.gallery = {
	priority: 20,
	title: "Gallery",
	icon: '<i class="university icon"></i>',
	menu: "widget",
	properties: {
		name: {
			title: 'Name',
			description: 'Name appears in the url query parameters',
			type: 'string',
			format: 'id',
			nullable: true
		}
	},
	contents: "portfolio carousel",
	group: 'block',
	html: `<element-gallery id="[name|id]"></element-gallery>`,
	resources: {
		helper: '../ui/gallery-helper.js'
	},
	stylesheets: [
		'../ui/gallery.css'
	],
	scripts: [
		'../ui/gallery.js'
	],
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	}
};

exports.itemlink = {
	priority: 10,
	title: "Item Link",
	icon: '<i class="icon linkify"></i>',
	menu: "widget",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			nullable: true,
			type: "string",
			format: "uri-reference",
			$helper: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		}
	},
	contents: "(paragraph_nolink|heading_nolink|image)+",
	html: '<a class="itemlink" href="[url|autolink]"></a>'
};
