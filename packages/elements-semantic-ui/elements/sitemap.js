Pageboard.elements.sitemap = {
	title: "Site map",
	standalone: true,
	contents: {
		children: {
			spec: "sitemap_item+",
			virtual: true
		}
	},
	html: '<element-accordion class="ui accordion" block-content="children"></element-accordion>',
	render: function(doc, block, view, scope) {
		if (!block.content) block.content = {};
		var html = '<div block-type="site[children.type|repeat]" block-id="[children.id]"></div>';
		block.content.children = doc.dom(html).fuse(block);
		return doc.dom(this.html).fuse(block.data, scope);
	},
	stylesheets: [
		'../semantic-ui/accordion.css',
		'../ui/sitemap.css'
	],
	scripts: [
		'../ui/sitemap.js'
	],
	resources: [
		'../ui/sitemap-helper.js'
	],
	install: function(doc, page, scope) {
		if (scope.$write) this.scripts.push(this.resources[0]);
	}
};

Pageboard.elements.sitepage = {
	title: "Page",
	icon: '<i class="icon file outline"></i>',
	menu: "link",
	group: 'sitemap_item',
	properties: Pageboard.elements.page.properties,
	contents: {
		children: {
			spec: "sitemap_item*",
			title: 'pages',
			virtual: true // this drops block.content.children, and all
		}
	},
	context: 'sitemap/ | sitepage/',
	html: `<element-sitepage class="item fold" data-url="[url]">
		<div class="title caret-icon">
			<span class="header">[title|or:Untitled]</span><br />
			<a href="[url]" class="description">[url|or:-]</a>
		</div>
		<div class="list content ui accordion" block-content="children"></div>
	</element-sitepage>`,
	render: Pageboard.elements.sitemap.render
};

if (Pageboard.elements.mail) Pageboard.elements.sitemail = {
	title: "Mail",
	icon: '<i class="icon mail outline"></i>',
	menu: "link",
	group: 'sitemap_item',
	get properties() {
		return Pageboard.elements.mail.properties;
	},
	context: 'sitemap/ | sitepage/',
	html: `<element-sitepage class="item" data-url="[url]">
		<div class="title">
			<span class="header">[title|or:Untitled]</span><br />
			<a href="[url]" class="description">[url|or:-]</a>
		</div>
	</element-sitepage>`,
	render: Pageboard.elements.sitemap.render
};

