Pageboard.elements.sitemap = {
	title: "Site map",
	properties: {
	},
	contents: {
		map: {
			spec: "(sitedir | sitepage)+",
			title: 'Root directory'
		}
	},
	group: "block",
	icon: '<i class="icon sitemap"></i>',
	view: function(doc, block, viewer) {
		var dom = doc.dom`<div class="ui list" block-content="map"></div>`;
		if (!this.loadCalled && block.id && viewer.dom) {
			this.load(block, viewer.modules.id);
		} else if (this.pages) {
			this.populate(dom, this.pages);
		}
		return dom;
	},
	load: function(block, idModule) {
		this.loadCalled = true;
		GET('/api/pages').then(function(pages) {
			this.pages = pages;
			pages.forEach(function(page) {
				page.type = 'sitepage';
			});
			idModule.set(pages);
			this.populate(idModule.domQuery(block.id), pages);
		}.bind(this));
	},
	populate: function(dom, pages) {
		if (!dom) {
			console.info("nothing to populate yet");
			return;
		}
		dom.textContent = '';
		pages.forEach(function(page) {
			var child = dom.ownerDocument.dom`<div block-id="${page.id}" block-type="sitepage"></div>`;
			dom.appendChild(child);
		});
	},
	// from: function(block, idModule) {
	// 	console.log(block.id, block.type)
	// },
	to: function(block, idModule) {
		delete block.content.map;
	},
	stylesheets: [
		'/.pageboard/semantic-ui/components/list.css'
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
		}
	},
	from: function(block) {
		block.type = 'sitepage';
	},
	to: function(block) {
		block.standalone = true;
		block.orphan = true;
		block.type = 'page';
	},
	icon: '<i class="icon file outline"></i>',
	view: function(doc, block) {
		return doc.dom`<div class="item">
			<i class="file icon"></i>
			<div class="content">
				<div class="header">${block.data.url}</div>
				<div class="description">${block.data.title}</div>
			</div>
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
	view: function(doc, block) {
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

