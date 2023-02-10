class HTMLSocialElement extends Page.Element {
	static defaults = {
		networks: (x) => (x || '').split(',').filter(x => Boolean(x)),
		title: null,
		image: null,
		description: null
	};

	static links = {
		linkedin: `<a target="_blank" href="https://www.linkedin.com/shareArticle?mini=true&url=[url|enc]" class="linkedin">LinkedIn</a>`,
		twitter: `<a target="_blank" href="https://twitter.com/intent/tweet?text=[url|enc]" class="twitter">Twitter</a>`,
		facebook: `<a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=[url|enc]" class="facebook">Facebook</a>`
	};

	patch(state) {
		state.finish(() => {
			const url = document.location.origin + Page.format({
				pathname: state.pathname
			});
			const card = {
				title: this.options.title,
				image: this.options.image,
				description: this.options.description,
				url
			};
			if (card.image) {
				const obj = Page.parse(card.image);
				obj.query.rs = 'w-800_h-450_max';
				card.image = document.location.origin + Page.format(obj);
			}
			const doc = document;
			const title = doc.head.querySelector('title');
			if (card.title && !title.textContent.startsWith(card.title)) {
				title.insertAdjacentText('afterBegin', card.title + ' - ');
			}

			for (const [key, val] of Object.entries(card)) {
				const sel = `meta[property="og:${key}"]`;
				const og = doc.head.querySelector(sel);
				if (!og) console.warn("missing", sel);
				else if (val) og.setAttribute('content', val);
				else og.removeAttribute('content');
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
	() => Page.define(`element-social`, HTMLSocialElement)
);
