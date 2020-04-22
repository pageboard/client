class HTMLElementBlogs extends HTMLCustomElement {
	static get defaults() {
		return {
			topics: (x) => (x || '').split(',').filter((x) => !!x)
		};
	}

	static transformResponse(res) {
		const parent = {
			type: 'blogs',
			children: [],
			content: {
				children: ''
			}
		};
		res.items.forEach((item) => {
			parent.children.push(item);
			parent.content.children += `<div block-id="${item.id}" block-type="item${item.type}"></div>`;
		});
		return parent;
	}

	patch(state) {
		this.dataset.url = state.pathname; // see write's page-title input helper
		let topics = this.options.topics;
		if (topics && !Array.isArray(topics)) topics = [topics];
		return Pageboard.bundle(Pageboard.fetch('get', '/.api/blocks', {
			type: 'blog',
			data: {
				'url:start': state.pathname + (state.pathname != '/' ? '/' : ''),
				'topics:in': topics
			},
			content: true,
			order: ['data.index']
		}), state).then(res => {
			state.scope.$element = state.scope.$elements.blogs;
			var node = Pageboard.render({
				item: this.constructor.transformResponse(res)
			}, state.scope);
			this.textContent = '';
			Array.from(node.children).forEach((node) => {
				this.appendChild(node);
			});
		});
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-blogs', HTMLElementBlogs);
});

