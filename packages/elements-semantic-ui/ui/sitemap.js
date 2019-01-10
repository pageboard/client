class HTMLElementSitemap extends HTMLCustomElement {
	static makeTree(tree, parent) {
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
			this.makeTree(tree[name], page);
		}, this);
		return parent;
	}

	static transformResponse(res) {
		var pages = res.items;
		var tree = {};
		pages.forEach(function(page) {
			if (!page.data.url) return;
			var branch = tree;
			var arr = page.data.url.substring(1).split('/');
			arr.forEach(function(name, i) {
				if (!branch[name]) branch[name] = {};
				branch = branch[name];
				if (i == arr.length - 1) branch._ = page;
			});
		});
		res.item = this.makeTree(tree);
		res.item.type = 'sitemap';
	}
	patch(state) {
		return Pageboard.bundle(Pageboard.fetch('get', `/.api/pages`), state.scope).then(function(res) {
			this.constructor.transformResponse(res);
			var node = Pageboard.render(res, state.scope);
			this.textContent = '';
			Array.from(node.children).forEach(function(node) {
				this.appendChild(node);
			}, this);
		}.bind(this));
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-sitemap', HTMLElementSitemap);
});

