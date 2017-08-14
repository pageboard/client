Pageboard.elements.sitemap = {
	title: "Site map",
	properties: {
	},
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
	unmount: function(block) {
		if (block.content.map != null) {
			delete block.content.map;
		}
	},
	mount: function(block, view) {
		return GET('/.api/pages').then(function(pages) {
			block.content.map = view.doc.dom`${pages.map(function(page) {
				var block = view.blocks.get(page.id);
				if (block) page = block; // do not overwrite the actual page object
				else view.blocks.set(page);
				return view.render(page, 'sitepage');
			})}`;
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
	unmount: function(copy) {
		copy.standalone = true; // a page is always standalone
		copy.orphan = true; // avoid relating to this page
		copy.type = 'page'; // sitepage -> page
	},
	icon: '<i class="icon file outline"></i>',
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

