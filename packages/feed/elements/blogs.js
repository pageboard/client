exports.blog = {
	title: 'Blog',
	icon: '<i class="newspaper outline icon"></i>',
	standalone: true,
	bundle: true,
	group: 'block',
	properties: {
		title: {
			title: 'Title',
			nullable: true,
			type: "string",
			format: "singleline",
			$helper: 'pageTitle'
		},
		url: {
			title: 'Address',
			type: "string",
			format: 'page',
			$helper: 'href',
			$filter: {
				name: 'helper',
				helper: 'pageUrl'
			}
		},
		draft: {
			title: 'Draft',
			type: 'boolean',
			default: true
		},
		publication: {
			title: 'Publication',
			type: 'string',
			format: 'date'
		},
		author: {
			title: 'Author',
			type: 'string',
			format: 'singleline'
		},
		topics: {
			title: 'Topics',
			type: 'array',
			items: {
				type: 'string'
			},
			nullable: true
		},
		thumbnail: {
			title: 'Thumbnail',
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
					type: ["image"]
				}
			}
		},
		description: {
			title: 'Description',
			type: 'string',
			nullable: true
		}
	},
	contents: [{
		id: 'content',
		nodes: 'block+'
	}],
	html: `<a href="[url]" class="ui" data-publication="[publication]">
		<div class="image">
			<element-image alt="thumbnail" data-src="[thumbnail|fail:**]"></element-image>
		</div>
		<div class="content">
			<div class="meta">[publication|fail:*|date:D:M:Y]</div>
			<div class="header">[title]</div>
			<div class="description">[description]</div>
		</div>
		<div class="extra" block-content="content"></div>
	</a>`,
};

/*
exports.page.extensions.rss = {
	bundle: true,


};
*/
// TODO
// an bundle element that can be added to the current page element
// when a specific extension is requested:
// .pdf, .rss, or more (.svg, .xml, etc)
// those elements are not "pages", however they are independent bundles
// that are loaded on top of the page

/*

exports.itemblog = { ...exports.siteblog,
	contents: exports.blog.contents.slice(1),
	context: 'blogs/',
	html: `<a href="[url]" class="ui" data-index="[index]" data-publication="[publication]">
		<div class="image" block-content="preview"></div>
		<div class="content">
			<div class="meta">[publication|fail:*|date:D:M:Y]</div>
			<div class="header">[title]</div>
			<div class="description" block-content="description"></div>
		</div>
	</a>`
};

exports.blogs = {
	title: 'Blogs',
	menu: 'link',
	group: 'block',
	icon: '<i class="icons"><i class="newspaper outline icon"></i><i class="corner search icon"></i></i>',
	contents: {
		nodes: "itemblog*",
		virtual: true
	},
	properties: {
		name: {
			title: 'Name',
			description: 'Name appears in the url query parameters',
			type: 'string',
			format: 'id',
			nullable: true
		},
		topics: exports.blog.properties.topics,
		list: {
			title: 'List',
			anyOf: [{
				const: 'items',
				title: 'Items'
			}, {
				const: 'cards',
				title: 'Cards'
			}],
			default: 'items'
		},
		shape: exports.cards.properties.shape,
		columns: exports.cards.properties.columns,
		responsive: exports.cards.properties.responsive,
		divided: {
			title: 'Divided',
			type: 'boolean',
			default: false
		},
		relaxed: {
			title: 'Relaxed',
			anyOf: [{
				const: null,
				title: 'No'
			}, {
				const: 'relaxed',
				title: 'Less'
			}, {
				const: 'very relaxed',
				title: 'More'
			}]
		}
	},
	html: `<element-blogs id="[name|as:xid]" data-topics="[topics|join:%2C]" class="ui [columns|as:colnums] [responsive] [shape] [divided] [relaxed] [list]"></element-blogs>`,
	scripts: [
		'../ui/blogs.js'
	],
	stylesheets: [
		'../ui/blogs.css'
	]
};
exports.editor?.scripts.push('../ui/blogs-helper.js');
*/
