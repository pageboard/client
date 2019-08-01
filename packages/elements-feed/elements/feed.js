exports.feed = {
	title: 'Feed',
	menu: "widget",
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
		id: 'header',
		title: 'Header',
		nodes: "block+"
	}, {
		id: 'preview',
		title: 'Preview',
		nodes: 'image?'
	}, {
		id: 'section',
		title: 'Section',
		nodes: 'paragraph+'
	}, {
		id: 'media',
		title: 'Section',
		nodes: 'block+'
	}, {
		id: 'footer',
		title: 'Footer',
		nodes: "paragraph+"
	}],
	group: "block",
	html: `<article pubdate="[publication]" topics="[topics|join:%2C]" class="ui equal width stackable grid">
		<aside class="six wide column" block-content="preview"></aside>
		<div class="column">
			<header block-content="header"><h2>Title</h2></header>
			<section block-content="section"><p>Text</p></section>
			<footer block-content="footer"><p>Footer</p></footer>
		</div>
		<div class="row" block-content="media"><p>Media</p></div>
	</article>`
};

