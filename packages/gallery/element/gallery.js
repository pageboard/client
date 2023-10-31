exports.gallery = {
	priority: 20,
	title: "Gallery",
	icon: '<i class="university icon"></i>',
	menu: "widget",
	bundle: true,
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
	html: `<element-gallery id="[name|as:xid]"></element-gallery>`,
	stylesheets: [
		'../ui/gallery.css'
	],
	scripts: [
		'../ui/gallery.js'
	]
};
exports.editor?.scripts.push('../ui/gallery-helper.js');

exports.itemlink = {
	priority: 10,
	title: "Item Link",
	icon: '<i class="icon linkify"></i>',
	menu: "widget",
	properties: {
		url: {
			title: 'Address',
			description: 'Local or remote',
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
	html: '<a class="itemlink" href="[url]"></a>'
};
