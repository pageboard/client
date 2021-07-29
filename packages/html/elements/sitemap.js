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
	resources: {
		helper: '../ui/sitemap-helper.js'
	},
	install: function(scope) {
		if (scope.$write) Pageboard.load.js(this.resources.helper, scope);
	},
	itemModel: function(name, leaf) {
		const schema = exports[name];
		return {
			title: schema.title,
			icon: schema.icon,
			standalone: true,
			properties: Object.assign({
				leaf: {
					type: 'boolean',
					default: Boolean(leaf)
				}
			}, schema.properties),
			menu: "link",
			group: 'sitemap_item',
			virtual: true,
			contents: leaf ? undefined : {
				id: 'children',
				nodes: "sitemap_item*",
				virtual: true
			},
			alias: name,
			context: 'sitemap/ | sitepage/',
			html: `<element-sitepage class="item [leaf|!?:fold]" data-url="[url]" data-index="[index]">
				<div class="title [leaf|!?:caret-icon]">
					<span class="header">[title|or:Untitled]</span>
					<span class="ui mini type label">[$type]</span>
					<span class="ui mini orange label">[nositemap|bmagnet:*]no sitemap</span>
					<span class="ui mini orange label">[noindex|bmagnet:*]no index</span>
					<span class="ui mini red label">[$lock.read|magnet:*]</span>
					<br>
					<a href="[url]" class="description">[url|or:-]</a>
				</div>
				<div class="list content [leaf|!|bmagnet:*]" block-content="children"></div>
			</element-sitepage>`
		};
	}
};

exports.sitepage = exports.sitemap.itemModel('page', false);

