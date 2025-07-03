class HTMLElementSheet extends Page.create(HTMLDivElement) {
	static defaults = {
		dataSrc: null,
		dataCrop: null,
		dataSizeH: null,
		dataSizeV: null
	};

	#defer;
	reveal(state) {
		if (!this.options.src) {
			this.style.setProperty('--width', this.options.sizeH || '100%');
			this.style.setProperty('--height', this.options.sizeV || '100%');
			this.style.removeProperty('--size-w');
			this.style.removeProperty('--size-h');
			this.style.removeProperty('--image');
			return;
		} else {
			this.style.setProperty('--size-w', this.options.sizeH || 'auto');
			this.style.setProperty('--size-h', this.options.sizeV || 'auto');
			this.style.removeProperty('--width');
			this.style.removeProperty('--height');
		}
		const srcLoc = Page.parse(this.options.src);
		const reqSrc = this.requestSrc(srcLoc);

		if (!reqSrc) {
			this.style.removeProperty('--image');
		} else if (reqSrc != this.currentSrc) {
			try {
				this.currentSrc = reqSrc;
			} catch (e) {
				// pass
			}
			this.#defer?.resolve();
			this.#defer = Promise.withResolvers();
			const img = new Image();
			img.addEventListener('load', this.#defer.resolve);
			img.addEventListener('error',
				e => this.#defer.reject(new Error(this.currentSrc))
			);
			img.src = reqSrc;
			this.style.setProperty('--image', `url("${reqSrc}")`);
			return this.#defer.promise;
		}
	}
	close() {
		this.#defer?.resolve();
	}
}

(function (HTMLElementImage) {
	for (const name of ['crop', 'dimensions', 'requestSrc']) {
		Object.defineProperty(
			HTMLElementSheet.prototype,
			name,
			Object.getOwnPropertyDescriptor(HTMLElementImage.prototype, name)
		);
	}
})(window.customElements.get('element-image'));

Page.define(`element-sheet`, HTMLElementSheet, 'div');
