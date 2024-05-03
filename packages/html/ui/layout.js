class HTMLElementLayout extends Page.create(HTMLDivElement) {
	static defaults = {
		dataSrc: null,
		dataCrop: null
	};

	#defer;

	get fit() {
		return this.style.backgroundSize || 'none';
	}
	reveal(state) {
		if (!this.options.src) {
			this.style.backgroundImage = '';
			return;
		}
		const srcLoc = Page.parse(this.options.src);
		const reqSrc = this.requestSrc(srcLoc);
		try {
			this.currentSrc = reqSrc;
		} catch (e) {
			// pass
		}
		if (!reqSrc) {
			this.style.backgroundImage = '';
		} else if (reqSrc != this.currentSrc) {
			this.#defer?.resolve();
			this.#defer = new Deferred();
			const img = new Image();
			img.addEventListener('load', this.#defer.resolve);
			img.addEventListener('error',
				e => this.#defer.reject(new Error(this.currentSrc))
			);
			img.src = reqSrc;
			this.style.backgroundImage = `url("${reqSrc}")`;
			return this.#defer;
		}
	}
	close() {
		this.#defer?.resolve();
	}
}

(function(HTMLElementImage) {
	for (const name of ['crop', 'dimensions', 'requestSrc']) {
		Object.defineProperty(
			HTMLElementLayout.prototype,
			name,
			Object.getOwnPropertyDescriptor(HTMLElementImage.prototype, name)
		);
	}
})(window.customElements.get('element-image'));

Page.define(`element-layout`, HTMLElementLayout, 'div');
