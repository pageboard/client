exports.sitemap = {
	title: "Sitemap",
	group: "block",
	bundle: true,
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
	itemModel: function(name, leaf) {
		const schema = exports[name];
		return {
			title: schema.title,
			icon: schema.icon,
			standalone: true,
			properties: {
				leaf: {
					type: 'boolean',
					default: Boolean(leaf)
				},
				...schema.properties
			},
			menu: "link",
			bundle: 'sitemap',
			group: 'sitemap_item',
			virtual: true,
			contents: leaf ? undefined : {
				id: 'children',
				nodes: "sitemap_item*",
				virtual: true
			},
			alias: name,
			context: 'sitemap/ | sitepage/',
			html: `<element-sitepage class="item [leaf|alt::fold]" data-url="[url]" data-index="[index]">
				<div class="title [leaf|alt::caret-icon]">
					<span class="header">[title|or:Untitled]</span>
					<span class="ui mini type label">[$grants.webmaster|prune:*][$type]</span>
					<span class="ui mini black label">[$grants.webmaster|prune:*][nositemap|prune:*]no sitemap</span>
					<span class="ui mini orange label">[$grants.webmaster|prune:*][noindex|prune:*]no index</span>
					<span class="ui mini red label">[$grants.webmaster|prune:*][$lock|fail:*]</span>
					<br>
					<a href="[url]" class="description">[url|or:-]</a>
					<a href="[redirect|fail:*]" class="redirection"> ➜ [redirect]</a>
				</div>
				<div class="list content [leaf|not:prune:*]" block-content="children"></div>
			</element-sitepage>`
		};
	}
};
exports.editor.scripts.push('../ui/sitemap-helper.js');
exports.sitepage = exports.sitemap.itemModel('page', false);
exports.siteredirection = exports.sitemap.itemModel('redirection', true);
