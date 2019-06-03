exports.gallery = {
	priority: 20,
	title: "Gallery",
	icon: '<i class="university icon"></i>',
	menu: "widget",
	properties: {
		name: {
			title: 'Name',
			type: 'string',
			format: 'id',
			nullable: true
		}
	},
	contents: {
		galleries: {
			spec: "(portfolio medialist carousel)|(portfolio|medialist|carousel)+"
		}
	},
	group: 'block',
	html: `<element-gallery id="[name|id]">
		<div class="ui tiny compact icon menu"></div>
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
	install: function(scope) {
		if (scope.$write) this.resources.forEach(function(url) {
			Pageboard.load.js(url, scope);
		});
	}
};

exports.itemlink = {
	priority: 10,
	title: "Item Link",
	icon: '<i class="icon linkify"></i>',
	menu: "widget",
	group: 'blocklink',
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote URL',
			nullable: true,
			anyOf: [{
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
		}
	},
	contents: {
		text: {
			spec: "(paragraph_nolink|heading|image)+"
		}
	},
	html: '<a class="itemlink" href="[url|autolink]" block-content="text"></a>'
};
