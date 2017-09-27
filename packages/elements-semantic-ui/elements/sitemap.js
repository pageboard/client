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
			spec: "sitepage*",
			ignore: true
		}
	},
	group: "block",
	icon: '<i class="icon sitemap"></i>',
	render: function(doc, block, view) {
		return doc.dom`<div class="ui list" block-content="children"></div>`;
	},
	mount: function(block, view) {
		block.content.children = view.doc.createDocumentFragment();
		return GET('/.api/pages').then(function(pages) {
			var tree = {};
			pages.forEach(function(page) {
				var storedPage = view.blocks.get(page.id);
				if (storedPage) {
					// do not overwrite the actual page object, use it for up-to-date render
					page = storedPage;
				} else {
					// problem: this does not update store's initial block list
					page.orphan = true;
					view.blocks.set(page);
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
				if (typeof parent.content.children == "string") {
					// not yet mounted
					return;
				}
				if (!parent.content.children) {
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
		'../ui/element-sitemap.css'
	],
	scripts: [
		'../ui/element-sitemap.js'
	]
};

Pageboard.elements.sitepage = {
	title: "Site page",
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null']
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "(\/[a-zA-Z0-9-.]*)+"
		},
		redirect: {
			title: 'Redirect',
			type: "string",
			pattern: "(\/[a-zA-Z0-9-.]*)+"
		}
	},
	contents: {
		children: {
			spec: "sitepage*",
			title: 'pages',
			ignore: true // won't serialize content
		}
	},
	inherits: "page", // TODO support this, effectively replacing the need for mount/unmount here
	unmount: function(block) {
		block.standalone = true; // a page is always standalone
		block.orphan = true; // avoid relating to this page

		// TODO this should be replaced by a simple
		// elements.sitepage.inherits = 'page'
		block.type = 'page'; // sitepage -> page
		// avoid erasing content in database
		if (block.content && Object.keys(block.content).length == 0) delete block.content;
	},
	mount: function(block) {
		block.type = 'page';
	},
	icon: '<i class="icon file outline"></i>',
	context: 'sitemap/ | sitepage/',
	render: function(doc, block) {
		return doc.dom`<element-sitepage class="item" data-url="${block.data.url}">
			<div class="content">
				<div class="header">${block.data.title}</div>
				<a href="${block.data.url}" class="description">${block.data.url}</a>
				<div class="list" block-content="children"></div>
			</div>
		</element-sitepage>`;
	}
};

