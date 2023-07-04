class HTMLElementSheet extends Page.create(HTMLDivElement) {
	static defaults = {
		dataSrc: null,
		dataCrop: null,
		dataWidth: null,
		dataHeight: null
	};

	#defer;
	reveal(state) {
		if (!this.options.src) {
			this.style.setProperty('--width', this.options.width);
			this.style.setProperty('--height', this.options.height);
			this.style.removeProperty('--size-w');
			this.style.removeProperty('--size-h');
			this.style.removeProperty('--image');
			return;
		} else {
			this.style.setProperty('--size-w', this.options.width);
			this.style.setProperty('--size-h', this.options.height);
			this.style.removeProperty('--width');
			this.style.removeProperty('--height');
		}
		const r = this.crop;

		const loc = Page.parse(this.options.src);

		if (r.x != 50 || r.y != 50 || r.w != 100 || r.h != 100) {
			if (Math.round((r.x - r.w / 2) * 100) < 0 || Math.round((r.x + r.w / 2) * 100) > 10000) {
				r.w = 2 * Math.min(r.x, 100 - r.x);
			}
			if (Math.round((r.y - r.h / 2) * 100) < 0 || Math.round((r.y + r.h / 2) * 100) > 10000) {
				r.h = 2 * Math.min(r.y, 100 - r.y);
			}
			loc.query.ex = `x-${r.x}_y-${r.y}_w-${r.w}_h-${r.h}`;
		}

		const curSrc = loc.toString();
		if (curSrc != this.currentSrc) {
			try {
				this.currentSrc = curSrc;
			} catch (e) {
				// pass
			}
			this.#defer?.resolve();
			this.#defer = new Deferred();
			const img = new Image();
			img.addEventListener('load', this.#defer.resolve);
			img.addEventListener('error', this.#defer.resolve);
			img.src = curSrc;
			this.style.setProperty('--image', `url("${curSrc}")`);
			return this.#defer;
		}
	}
	close() {
		this.#defer?.resolve();
	}
}

(function (HTMLElementImage) {
	for (const name of ['crop']) {
		Object.defineProperty(
			HTMLElementSheet.prototype,
			name,
			Object.getOwnPropertyDescriptor(HTMLElementImage.prototype, name)
		);
	}
})(window.customElements.get('element-image'));

Page.define(`element-sheet`, HTMLElementSheet, 'div');
