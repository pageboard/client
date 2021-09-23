exports.blog = Object.assign({}, exports.page, {
	title: 'Blog',
	bundle: 'page',
	icon: '<i class="newspaper outline icon"></i>',
	contents: exports.page.contents.concat([{
		id: 'preview',
		title: 'Preview',
		nodes: 'image'
	}, {
		id: 'description',
		title: 'Description',
		nodes: "inline*"
	}]),
	properties: Object.assign({}, exports.page.properties, {
		publication: {
			title: 'Publication',
			type: 'string',
			format: 'date'
		},
		topics: {
			title: 'Topics',
			type: 'array',
			items: {
				type: 'string'
			},
			nullable: true
		}
	}),
	scripts: exports.page.scripts.concat(['../ui/blog.js']),
	fragments: [{
		path: 'html > head > meta',
		position: 'afterend',
		html: `<meta property="og:type" content="article">
			<meta property="og:title" content="[title]">
			<meta property="og:description" block-content="description" />
			<meta property="og:image" block-content="preview" />
			<meta property="article:published_time" content="[publication|magnet:*|isoDate]">
			<meta property="article:tag" content="[topics|repeat:*|magnet:*]">`
	}]
});

exports.siteblog = exports.sitemap.itemModel('blog', true);

exports.itemblog = Object.assign({}, exports.siteblog, {
	contents: exports.blog.contents.slice(1),
	context: 'blogs/',
	html: `<a href="[url]" class="ui" data-index="[index]" data-publication="[publication]">
		<div class="image" block-content="preview"></div>
		<div class="content">
			<div class="meta">[publication|magnet|formatDate:D:M:Y]</div>
			<div class="header">[title]</div>
			<div class="description" block-content="description"></div>
		</div>
	</a>`
});

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
	html: `<element-blogs id="[name|id]" data-topics="[topics|join:%2C]" class="ui [columns|num] [responsive] [shape] [divided|?] [relaxed] [list]"></element-blogs>`,
	scripts: [
		'../ui/blogs.js'
	],
	stylesheets: [
		'../ui/blogs.css'
	],
	resources: {
		helper: '../ui/blogs-helper.js'
	},
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	},
};

