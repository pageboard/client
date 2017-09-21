Pageboard.elements.sitemap = {
	title: "Site map",
	contents: {
		map: {
			spec: "sitepage*",
			title: 'Pages'
		}
	},
	group: "block",
	icon: '<i class="icon sitemap"></i>',
	render: function(doc, block, view) {
		return doc.dom`<div class="ui list" block-content="map"></div>`;
	},
	mount: function(block, view) {
		return GET('/.api/pages').then(function(pages) {
			if (!block.content.map) block.content.map = view.doc.createDocumentFragment();
			var pagesMap = {};
			var child;
			var children = block.content.map.children;
			for (var i=0; i < children.length; i++) {
				child = children[i];
				if (child.getAttribute('block-type') == "sitepage") {
					pagesMap[child.getAttribute('block-id')] = child;
				}
			}
			pages.forEach(function(page) {
				var storedPage = view.blocks.get(page.id);
				if (storedPage) {
					// do not overwrite the actual page object, use it for up-to-date render
					page = storedPage;
				} else {
					view.blocks.set(page);
				}
				var dom = view.render(page, 'sitepage');
				var pdom = pagesMap[page.id];
				if (pdom) {
					pdom.parentNode.replaceChild(dom, pdom);
					delete pagesMap[page.id];
				} else {
					block.content.map.appendChild(dom);
				}
			});
			for (var id in pagesMap) {
				child = pagesMap[id];
				child.parentNode.removeChild(child);
			}
		}).catch(function(err) {
			console.error("caught error", err);
		});
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/list.css',
		'../ui/sitemap.css'
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
	unmount: function(block) {
		block.standalone = true; // a page is always standalone
		block.orphan = true; // avoid relating to this page
		if (block.id != document.body.getAttribute('block-id')) delete block.content;
		block.type = 'page'; // sitepage -> page
	},
	mount: function(block) {
		block.type = 'page';
	},
	icon: '<i class="icon file outline"></i>',
	context: 'sitemap/',
	render: function(doc, block) {
		return doc.dom`<div class="item">
			<i class="file icon"></i>
			<a class="content" href="${block.data.url}">
				<div class="header">${block.data.title}</div>
				<div class="description">${block.data.url}</div>
			</a>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/icon.css'
	]
};

Pageboard.elements.sitedir = {
	title: "Directory",
	properties: {
		title: {
			title: 'Title',
			type: ['string', 'null']
		},
		url: {
			title: 'Address',
			type: "string",
			pattern: "(\/[a-zA-Z0-9-.]*)+"
		}
	},
	contents: {
		list: {
			spec: "(sitedir | sitepage)*",
			title: 'Subdirectory'
		}
	},
	// from: function(block) {
	// 	block.type = 'sitepage';
	// 	if (block.type == "sitepage") return;
	// 	return Object.assign(block, {type: 'sitepage'});
	// },
	// to: function(block) {
	// 	if (block.type == "page") return;
	// 	return Object.assign(block, {type: 'page'});
	// },
	icon: '<i class="icon folder outline"></i>',
	context: 'sitemap/',
	render: function(doc, block) {
		return doc.dom`<div class="item">
			<i class="folder icon"></i>
			<div class="content">
				<div class="header">${block.data.url}</div>
				<div class="description">${block.data.title}</div>
				<div class="list" block-content="list"></div>
			</div>
		</div>`;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/icon.css'
	]
};

