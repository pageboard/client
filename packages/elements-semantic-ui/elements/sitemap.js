/*
sitemap
sitepage
sitedir is a "container" pattern: it contains a sitepage if its url has a page,
and a list of sitepages which url starts with that sitedir.
sitedir is inplace to avoid having unnecessary structure hanging in the blocks table

*/
Pageboard.elements.sitemap = {
	title: "Site map",
	menu: "link",
	contents: {
		children: {
			spec: "sitepage+",
			virtual: true
		}
	},
	group: "block",
	icon: '<i class="icon sitemap"></i>',
	render: function(doc, block, view) {
		return doc.dom`<div class="ui list" block-content="children"></div>`;
	},
	mount: function(block, blocks, view) {
		if (!block.content) block.content = {};
		if (!block.content.children) {
			// restore might have already filled children
			block.content.children = view.doc.createDocumentFragment();
		}
		return GET('/.api/pages').then(function(pages) {
			var tree = {};
			pages.forEach(function(page) {
				var storedPage = blocks[page.id];
				if (storedPage) {
					// do not overwrite the actual page object, use it for up-to-date render
					page = storedPage;
				} else {
					blocks[page.id] = page;
				}
				var branch = tree;
				var arr = page.data.url.substring(1).split('/');
				arr.forEach(function(name, i) {
					if (!branch[name]) branch[name] = {};
					branch = branch[name];
					if (i == arr.length - 1) branch._ = page;
				});
			});
			return tree;
		}).then(fillChildren).catch(function(err) {
			console.error(err);
		});

		function fillChildren(tree, parent) {
			if (!parent) parent = block;
			var page = tree._;
			if (page) {
				if (!parent.content) parent.content = {};
				if (!parent.content.children) {
					// restore might have already filled children
					parent.content.children = view.doc.createDocumentFragment();
				}
				var newChild = view.render(page, 'sitepage');
				var existing = parent.content.children.querySelector(`[block-id="${page.id}"]`);
				if (existing) {
					// this is a workaround - block.content.children above should be empty...
					existing.replaceWith(newChild);
				} else {
					parent.content.children.appendChild(newChild);
				}
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
				fillChildren(tree[name], page);
			});
		}
	},
	stylesheets: [
		'../semantic-ui/list.css',
		'../ui/sitemap.css'
	],
	helpers: [
		'../ui/sitemap-helper.js'
	]
};

Pageboard.elements.sitepage = {
	title: "Site page",
	menu: "link",
	properties: Pageboard.elements.page.properties,
	contents: {
		children: {
			spec: "sitepage*",
			title: 'pages',
			virtual: true // this drops block.content.children, and all
		}
	},
	unmount: function(block, node) {
		// added pages NEED to have their type overriden
		block.type = 'page';
		var pos = 0;
		while (node=node.previousElementSibling) pos++;
		block.data.index = pos;
	},
	icon: '<i class="icon file outline"></i>',
	context: 'sitemap/ | sitepage/',
	render: function(doc, block) {
		return doc.dom`<element-sitepage class="item" data-url="${block.data.url}">
			<div class="content">
				<div class="header">${block.data.title || 'Untitled'}</div>
				<a href="${block.data.url}" class="description">${block.data.url || '-'}</a>
				<div class="list" block-content="children"></div>
			</div>
		</element-sitepage>`;
	}
};

