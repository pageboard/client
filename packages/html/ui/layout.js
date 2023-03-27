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
		const fit = this.fit;
		const r = this.crop;

		let loc = Page.parse(this.options.src);
		if (loc.hostname && loc.hostname != document.location.hostname) {
			loc = Page.parse({
				pathname: "/.api/image",
				query: {
					url: this.options.src
				}
			});
		}

		if (r.x != 50 || r.y != 50 || r.w != 100 || r.h != 100) {
			if (Math.round((r.x - r.w / 2) * 100) < 0 || Math.round((r.x + r.w / 2) * 100) > 10000) {
				r.w = 2 * Math.min(r.x, 100 - r.x);
			}
			if (Math.round((r.y - r.h / 2) * 100) < 0 || Math.round((r.y + r.h / 2) * 100) > 10000) {
				r.h = 2 * Math.min(r.y, 100 - r.y);
			}
			loc.query.ex = `x-${r.x}_y-${r.y}_w-${r.w}_h-${r.h}`;
		}
		const {w, h} = this.dimensions;
		if (fit == "none") {
			loc.query.rs = `z-${r.z}`;
		} else if (!Number.isNaN(w) && !Number.isNaN(h)) {
			const rect = this.getBoundingClientRect();
			const rw = rect.width;
			const rh = rect.height;
			if (rw == 0 && rh == 0) {
				// don't show
				return;
			}
			loc.query.rs = "z-" + HTMLElementLayout.getZoom({w, h, rw, rh, fit});
		}
		const curSrc = loc.toString();
		if (curSrc != this.currentSrc) {
			try {
				this.currentSrc = curSrc;
			} catch(e) {
				// pass
			}
			this.#defer = new Deferred();
			const img = new Image();
			img.addEventListener('load', this.#defer.resolve);
			img.addEventListener('error', this.#defer.resolve);
			img.src = curSrc;
			this.style.backgroundImage = `url("${curSrc}")`;
			return this.#defer;
		}
	}
}

(function(HTMLElementImage) {
HTMLElementLayout.getZoom = HTMLElementImage.getZoom;
for (const name of ['crop', 'dimensions']) {
	Object.defineProperty(
		HTMLElementLayout.prototype,
		name,
		Object.getOwnPropertyDescriptor(HTMLElementImage.prototype, name)
	);
}
})(window.customElements.get('element-image'));

Page.define(`element-layout`, HTMLElementLayout, 'div');
