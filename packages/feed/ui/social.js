class HTMLSocialElement extends Page.Element {
	static defaults = {
		networks: (x) => (x || '').split(',').filter(x => Boolean(x)),
		image: null
	};

	static links = {
		linkedin: `<a target="_blank" href="https://www.linkedin.com/shareArticle?mini=true&url=[url|enc:url]" class="linkedin">LinkedIn</a>`,
		twitter: `<a target="_blank" href="https://twitter.com/intent/tweet?text=[url|enc:url]" class="twitter">Twitter</a>`,
		facebook: `<a target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=[url|enc:url]" class="facebook">Facebook</a>`
	};

	patch(state) {
		state.finish(() => {
			const url = document.location.origin + Page.format({
				pathname: state.pathname
			});
			const card = {
				url
			};

			card.image = document.querySelectorAll('element-image')
				.find(item => {
					return parseFloat(item.dataset.width) > 256 && parseFloat(item.dataset.height) > 256;
				}) ?? this.options.image;

			if (card.image) {
				const obj = Page.parse(card.image);
				obj.query.rs = 'w-600_h-350_max';
				card.image = document.location.origin + Page.format(obj);
			}
			const doc = document;
			card.title = doc.head.querySelector('title')?.innerText;
			card.description = doc.head.querySelector('meta[name="description"]')?.innerText;

			for (const [key, val] of Object.entries(card)) {
				const sel = `meta[property="og:${key}"]`;
				const og = doc.head.querySelector(sel) ?? doc.head.appendChild(doc.dom(`<meta property="og:${key}">`));
				if (val) og.setAttribute('content', val);
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

Page.define(`element-social`, HTMLSocialElement);
