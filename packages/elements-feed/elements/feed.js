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
		id: 'title',
		title: 'Title',
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
	}, {
		id: 'footer',
		title: 'Footer',
		nodes: "paragraph+"
	}],
	group: "block",
	html: `<article pubdate="[publication]" class="ui equal width stackable grid">
		<aside class="six wide column" block-content="preview"></aside>
		<div class="column">
			<header>
				<p>
					<span class="topics">[topics|join:%20-%20]</span>
					<span class="pubdate">[publication|formatDate:D:month:Y]</span>
				</p>
				<h2 block-content="title">Title</h2>
			</header>
			<section block-content="section"><p>Text</p></section>
			<footer block-content="footer"><p>Footer</p></footer>
		</div>
		<div class="row" block-content="extra"><p>Additional content</p></div>
	</article>`
};

