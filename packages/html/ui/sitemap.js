class HTMLElementSitemap extends VirtualHTMLElement {
	static makeTree(tree, parent) {
		if (!parent) parent = {
			type: 'sitemap'
		};
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

	static transformResponse(res) {
		var pages = res.items;
		var tree = {};
		pages.forEach(function(page) {
			if (!page.data.url) return;
			if (page.content) {
				delete page.content.children;
				delete page.children;
			}
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

	build(state) {
		return Pageboard.bundle(Pageboard.fetch('get', `/.api/pages`), state).then(res => {
			state.scope.$element = state.scope.$elements.sitemap;
			const tree = this.constructor.transformResponse(res);
			var node = Pageboard.render({
				item: tree
			}, state.scope);
			// only change block content
			const src = node.firstElementChild;
			const dst = this.firstElementChild;
			dst.textContent = '';
			while (src.firstChild) dst.appendChild(src.firstChild);
		});
	}
}

Page.ready(function() {
	VirtualHTMLElement.define('element-sitemap', HTMLElementSitemap);
});

