exports.sitemap = {
	title: "Site map",
	group: "block",
	icon: '<i class="sitemap icon"></i>',
	menu: 'link',
	contents: {
		id: 'children',
		nodes: "sitemap_item*",
		virtual: true
	},
	html: `<element-sitemap>
		<element-accordion class="ui accordion" block-content="children"></element-accordion>
	</element-sitemap>`,
	stylesheets: [
		'../lib/components/accordion.css',
		'../ui/sitemap.css'
	],
	scripts: [
		'../ui/sitemap.js'
	],
	resources: [
		'../ui/sitemap-helper.js'
	],
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources[0], scope);
	}
};

exports.sitepage = {
	title: "Page",
	icon: '<i class="icon file outline"></i>',
	menu: "link",
	group: 'sitemap_item',
	properties: exports.page.properties,
	virtual: true,
	contents: {
		id: 'children',
		nodes: "sitemap_item*",
		virtual: true
	},
	alias: 'page',
	context: 'sitemap/ | sitepage/',
	html: `<element-sitepage class="item fold" data-url="[url]" data-index="[index]">
		<div class="title caret-icon">
			<span class="header">[title|or:Untitled]</span><br />
			<a href="[url]" class="description">[url|or:-]</a>
		</div>
		<div class="list content" block-content="children"></div>
	</element-sitepage>`
};

if (exports.mail) exports.sitemail = {
	title: "Mail",
	icon: '<i class="icon mail outline"></i>',
	menu: "link",
	group: 'sitemap_item',
	alias: 'mail',
	virtual: true,
	get properties() {
		return exports.mail.properties;
	},
	context: 'sitemap/ | sitepage/',
	html: `<element-sitepage class="item" data-url="[url]" data-index="[index]">
		<div class="title">
			<span class="header">[title|or:Untitled]</span><br />
			<a href="[url]" class="description">[url|or:-]</a>
		</div>
	</element-sitepage>`
};

