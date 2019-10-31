exports.feed = {
	title: 'Feed',
	menu: "widget",
	standalone: true,
	group: "block",
	icon: '<i class="newspaper outline icon"></i>',
	properties: {
		topics: {
			title: 'Topics',
			type: 'array',
			items: {
				type: 'string'
			},
			nullable: true
		},
		publication: {
			title: 'Publication',
			type: 'string',
			format: 'date'
		}
	},
	contents: [{
		id: 'title',
		title: 'Title',
		nodes: "inline*"
	}, {
		id: 'description',
		title: 'Description',
		nodes: "inline*"
	}, {
		id: 'preview',
		title: 'Preview',
		nodes: 'image?'
	}, {
		id: 'section',
		title: 'Section',
		nodes: 'paragraph+'
	}, {
		id: 'extra',
		title: 'Extra',
		nodes: 'block+'
	}],
	html: `<article pubdate="[publication]" class="ui equal width stackable grid">
		<aside class="six wide column" block-content="preview"></aside>
		<div class="column">
			<nav>
				<span class="topics">[topics|join:%20-%20]</span>
				<span class="pubdate">[publication|formatDate:D:month:Y]</span>
				<element-share></element-share>
			</nav>
			<header>
				<h2 block-content="title">Title</h2>
				<p block-content="description">Description</p>
			</header>
			<section block-content="section"><p>Article</p></section>
		</div>
		<div class="row">
			<div class="column" block-content="extra"><p>Extra content</p></div>
		</div>
	</article>`,
	scripts: [
		'../ui/feed.js'
	]
};

exports['.rss'] = {
	prerender: {
		mime: 'application/xml'
	},
	scripts: [
		'../ui/rss.js'
	]
};
