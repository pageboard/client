/*
sitemap
sitepage
sitedir is a "container" pattern: it contains a sitepage if its url has a page,
and a list of sitepages which url starts with that sitedir.
sitedir is inplace to avoid having unnecessary structure hanging in the blocks table

*/
Pageboard.elements.sitemap = {
	title: "Site map",
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
					// problem: this does not update store's initial block list
					page.orphan = true;
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
				parent.content.children.appendChild(view.render(page, 'sitepage'));
				delete tree._;
			} else {
				page = parent;
			}
			Object.keys(tree).forEach(function(name) {
				fillChildren(tree[name], page);
			});
		}
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/list.css',
		'../ui/sitemap.css'
	],
	helpers: [
		'../ui/sitemap-helper.js'
	]
};

Pageboard.elements.sitepage = {
	title: "Site page",
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null'],
			input: {
				name: 'pageTitle'
			}
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "(\/[a-zA-Z0-9-.]*)+",
			input: {
				name: 'pageUrl'
			}
		},
		redirect: {
			title: 'Redirect',
			type: "string",
			format: "uri",
			input: {
				name: 'href',
				filter: {
					type: ["link", "file", "archive"]
				}
			}
		}
	},
	contents: {
		children: {
			spec: "sitepage*",
			title: 'pages',
			virtual: true // this drops block.content.children, and all
		}
	},
	unmount: function(block) {
		// TODO a block that is not in any content *should* be orphan
		// since block.content.children is dropped, sitepages do not belong to any
		// block on the page, making them orphans. On the contrary all blocks that
		// are not standalone and that are in the content of a block on the current page
		// should be related to it.
		block.orphan = true;
		// added pages NEED to have their type overriden
		block.type = 'page';
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

