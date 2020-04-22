class HTMLShareAnchorElement extends HTMLAnchorElement {
	static get defaults() {
		return {
			dataNetwork: ""
		};
	}
	patch(state) {
		const url = {
			linkedin: 'https://www.linkedin.com/shareArticle?mini=true&url=[url]',
			twitter: 'https://twitter.com/intent/tweet?text=[url]',
			pinterest: 'https://pinterest.com/pin/create/button/?url=[url]',
			facebook: 'https://www.facebook.com/sharer/sharer.php?u=[url]'
		}[this.options.network];
		if (url) {
			this.href = url.fuse({
				title: document.title,
				url: encodeURIComponent(document.location.href),
			});
		} else {
			this.removeAttribute('href');
		}
	}
}

Page.patch(function(state) {
	HTMLCustomElement.define(`element-share`, HTMLShareAnchorElement, 'a');
});

