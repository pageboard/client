class HTMLElementSitemap extends VirtualHTMLElement {
	static makeTree(tree, parent) {
		let page = tree._;
		if (page) {
			if (!parent.children) parent.children = [];
			const old = parent.children.find(item => item.id == page.id);
			if (!old) parent.children.push(page);
			if (parent.content == null) parent.content = {};
			if (parent.content.children == null) parent.content.children = "";
			if (typeof parent.content.children == "string") {
				parent.content.children += `<div block-id="${page.id}" block-type="${page.type}"></div>`;
			}
			delete tree._;
		} else {
			page = parent;
		}
		for (const name of Object.keys(tree).sort((a, b) => {
			const pageA = tree[a]._;
			const pageB = tree[b]._;
			if (!pageA || !pageB) return 0;
			let indexA = pageA.data.index;
			if (indexA == null) indexA = Infinity;
			let indexB = pageB.data.index;
			if (indexB == null) indexB = Infinity;
			if (indexA == indexB) return 0;
			else if (indexA < indexB) return -1;
			else if (indexA > indexB) return 1;
		})) {
			this.makeTree(tree[name], page);
		}
		return parent;
	}

	static transformResponse(res) {
		const pages = res.items;
		const tree = {};

		for (const page of pages) {
			if (!page.data.url) continue;
			let branch = tree;
			const arr = page.data.url.substring(1).split('/');
			arr.forEach((name, i) => {
				if (!branch[name]) branch[name] = {};
				branch = branch[name];
				if (i == arr.length - 1) branch._ = page;
			});
		}
		return this.makeTree(tree, {
			type: 'sitemap',
			content: { children: '' },
			children: []
		});
	}

	build(state) {
		if (this.firstElementChild.children.length > 0 && this.isContentEditable) {
			// workaround... build is called a second time with pagecut-placeholder set
			return;
		}
		return Pageboard.bundle(Pageboard.fetch('get', `/.api/pages`), state).then(res => {
			state.scope.$element = state.scope.$elements.sitemap;
			const tree = this.constructor.transformResponse(res);
			const node = Pageboard.render({
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


VirtualHTMLElement.define('element-sitemap', HTMLElementSitemap);


