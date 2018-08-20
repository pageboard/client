Page.build(function(state) {
	var sitemaps = Array.from(document.querySelectorAll('[block-type="sitemap"]'));
	if (sitemaps.length > 0) return Pageboard.build('/.api/pages', {
		transform: function(res) {
			var pages = res.data;
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
			res.data = makeTree(tree);
			res.data.type = 'sitemap';
		}
	}).then(function(dom) {
		Array.from(dom.children).forEach(function(node) {
			sitemaps.forEach(function(sitemap) {
				sitemap.appendChild(node.cloneNode(true));
			});
		});
	});

	function makeTree(tree, parent) {
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
			makeTree(tree[name], page);
		});
		return parent;
	}
});

