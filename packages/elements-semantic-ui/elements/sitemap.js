Pageboard.elements.sitemap = {
	title: "Site map",
	group: "block",
	icon: '<i class="sitemap icon"></i>',
	menu: 'link',
	contents: {
		children: {
			spec: "sitemap_item+",
			virtual: true
		}
	},
	html: `<element-sitemap class="ui accordion" block-content="children"></element-sitemap>`,
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
		// sitemap is standalone so has scripts array
		// if (scope.$write) Pageboard.load.js(this.resources[0], scope);
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
	unmount: function(block) {
		if (block.type.startsWith('site')) block.type = block.type.substring(4);
	},
	context: 'sitemap/ | sitepage/',
	html: `<element-sitepage class="item fold" data-url="[url]">
		<div class="title caret-icon">
			<span class="header">[title|or:Untitled]</span><br />
			<a href="[url]" class="description">[url|or:-]</a>
		</div>
		<div class="list content ui accordion" block-content="children"></div>
	</element-sitepage>`
};

if (Pageboard.elements.mail) Pageboard.elements.sitemail = {
	title: "Mail",
	icon: '<i class="icon mail outline"></i>',
	menu: "link",
	group: 'sitemap_item',
	get properties() {
		return Pageboard.elements.mail.properties;
	},
	unmount: function(block) {
		if (block.type.startsWith('site')) block.type = block.type.substring(4);
	},
	context: 'sitemap/ | sitepage/',
	html: `<element-sitepage class="item" data-url="[url]">
		<div class="title">
			<span class="header">[title|or:Untitled]</span><br />
			<a href="[url]" class="description">[url|or:-]</a>
		</div>
	</element-sitepage>`
};

