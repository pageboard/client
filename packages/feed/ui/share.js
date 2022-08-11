class HTMLShareAnchorElement extends HTMLAnchorElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataNetwork: ""
	};

	patch(state) {
		const href = document.location.origin + Page.format({
			pathname: state.pathname,
			query: { ...state.query }
		});
		const card = {
			url: href
		};
		for (const name of ['title', 'description', 'image']) {
			const node = document.head.querySelector(`meta[property="og:${name}"]`);
			if (node?.content) card[name] = node.content;
		}

		const obj = {
			linkedin: {
				url: 'https://www.linkedin.com/shareArticle',
				query: {
					mini: true,
					url: card.url
				}
			},
			twitter: {
				url: 'https://twitter.com/intent/tweet',
				query: {
					text: card.url
				}
			},
			pinterest: {
				url: 'https://pinterest.com/pin/create/button/',
				query: {
					url: card.url,
					media: card.image,
					description: card.title
				}
			},
			facebook: {
				url: 'https://www.facebook.com/sharer/sharer.php',
				query: {
					u: card.url
				}
			}
		}[this.options.network];
		if (obj) {
			const urlObj = Page.parse(obj.url);
			urlObj.query = obj.query;
			this.href = urlObj.toString();
		} else {
			this.removeAttribute('href');
		}
	}
}

Page.patch(
	() => VirtualHTMLElement.define(`element-share`, HTMLShareAnchorElement, 'a')
);
