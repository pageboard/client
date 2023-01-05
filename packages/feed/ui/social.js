class HTMLSocialElement extends VirtualHTMLElement {
	static defaults = {
		networks: (x) => (x || '').split(',').filter(x => Boolean(x)),
		thumbnail: null,
		description: null
	};

	static links = {
		linkedin: `<a href="https://www.linkedin.com/shareArticle?mini=true&url=[url|enc]" class="linkedin">LinkedIn</a>`,
		twitter: `<a href="https://twitter.com/intent/tweet?text=[url|enc]" class="twitter">Twitter</a>`,
		facebook: `<a href="https://www.facebook.com/sharer/sharer.php?u=[url|enc]" class="facebook">Facebook</a>`
	};

	patch(state) {
		state.finish(() => {
			const href = document.location.origin + Page.format({
				pathname: state.pathname,
				query: { ...state.query }
			});
			const card = {
				title: document.title,
				url: href,
				description: this.options.description,
				thumbnail: this.options.thumbnail
			};
			if (card.thumbnail) {
				const obj = Page.parse(card.thumbnail);
				obj.query.rs = 'w-800_h-450_max';
				card.thumbnail = document.location.origin + Page.format(obj);
			}
			const doc = this.ownerDocument;
			const title = doc.head.querySelector('title');
			let ogDesc = doc.head.querySelector(`meta[name="description"]`);
			if (card.description) {
				if (!ogDesc) {
					ogDesc = doc.dom(`<meta name="description">`);
					doc.head.insertBefore(ogDesc, title.nextElementSibling);
				}
				ogDesc.setAttribute('content', card.description);
			}
			const ogImage = doc.head.querySelector(`meta[property="og:image"]`);
			if (card.thumbnail) {
				ogImage.setAttribute('content', card.thumbnail);
			}
			const { links } = HTMLSocialElement;
			this.textContent = '';
			for (const key of this.options.networks) {
				this.appendChild(doc.dom(links[key]).fuse(card, state.scope));
			}
		});
	}
}

Page.patch(
	() => VirtualHTMLElement.define(`element-social`, HTMLSocialElement)
);
