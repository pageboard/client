class HTMLElementSitemap extends HTMLCustomElement {
	static makeTree(tree, parent) {
		if (!parent) parent = {};
		if (!parent.children) parent.children = [];
		if (!parent.content) parent.content = {};
		if (!parent.content.children) parent.content.children = '';
		var page = tree._;
		if (page) {
			parent.children.push(page);
			parent.content.children += `<div block-id="${page.id}" block-type="site${page.type}"></div>`;
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

	static transformResponse(res, view) {
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
		return this.makeTree(tree);
	}
	patch(state) {
		var view = state.scope.$view;
		return Pageboard.bundle(Pageboard.fetch('get', `/.api/pages`), state.scope).then(function(res) {
			state.scope.$element = state.scope.$elements.sitemap;
			var node = Pageboard.render({
				item: this.constructor.transformResponse(res, view)
			}, state.scope);
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

