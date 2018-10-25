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
	render: function(block, scope) {
		if (block.type == "sitemap") {
			var tree = {};
			block.children.forEach(function(page) {
				if (!page.data.url) return;
				var branch = tree;
				var arr = page.data.url.substring(1).split('/');
				arr.forEach(function(name, i) {
					if (!branch[name]) branch[name] = {};
					branch = branch[name];
					if (i == arr.length - 1) branch._ = page;
				});
			});
			block.children = this.tree(tree).children;
		}
		return this.virtualRender(block, scope);
	},
	virtualRender: function(block, scope) {
		var html = '<div block-type="site[children.type|repeat]" block-id="[children.id]"></div>';
		if (!block.content) block.content = {};
		block.content.children = scope.$doc.dom(html).fuse(block);
		return scope.$doc.dom(this.html).fuse(block.data, scope);
	},
	tree: function(tree, parent) {
		if (!parent) parent = {};
		if (!parent.children) parent.children = [];
		var page = tree._;
		if (page) {
			parent.children.push(page);
			delete tree._;
		} else {
			page = parent;
		}
		Object.keys(tree).sort(function(a, b) {
			var pageA = tree[a]._;
			var pageB = tree[b]._;
			if (!pageA || !pageB) return 0;
			var indexA = pageA.data.index;
			if (indexA == null) indexA = Infinity;
			var indexB = pageB.data.index;
			if (indexB == null) indexB = Infinity;
			if (indexA == indexB) return 0;
			else if (indexA < indexB) return -1;
			else if (indexA > indexB) return 1;
		}).forEach(function(name) {
			this.tree(tree[name], page);
		}, this);
		return parent;
	},
	stylesheets: [
		'../semantic-ui/accordion.css',
		'../ui/sitemap.css'
	],
	resources: [
		'../ui/sitemap-helper.js'
	],
	install: function(scope) {
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
	render: Pageboard.elements.sitemap.virtualRender
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
	render: Pageboard.elements.sitemap.virtualRender
};

