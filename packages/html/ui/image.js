const HTMLElementImageConstructor = Superclass => class extends Superclass {
	static defaults = {
		src: null,
		crop: null
	};

	static defaultWidth = 240;
	static defaultHeight = 180;

	#defer;

	get dimensions() {
		// dimension in pixels of the (extracted) source image
		let w = parseInt(this.dataset.width);
		let h = parseInt(this.dataset.height);
		const { crop } = this;
		if (crop.w != 100) {
			w = Math.round(w * crop.w / 100);
		}
		if (crop.h != 100) {
			h = Math.round(h * crop.h / 100);
		}
		if (crop.z != 100) {
			w = Math.round(w * crop.z / 100);
			h = Math.round(h * crop.z / 100);
		}
		return { w, h };
	}
	findClass(list) {
		return list.find(name => this.matches(`.${name}`)) || list[0];
	}
	get fit() {
		return this.findClass(['none', 'contain', 'cover']);
	}
	get position() {
		const h = this.findClass(['left', 'hcenter', 'right']);
		const v = this.findClass(['top', 'vcenter', 'bottom']);
		return `${h} ${v}`.trim();
	}
	set fit(val) {
		this.classList.add(val);
	}
	set position(val) {
		(val || '').split(' ').forEach(val => {
			if (val) this.classList.add(val);
		});
	}
	get crop() {
		const defs = [50, 50, 100, 100, 100];
		const list = (this.dataset.crop || ";;;;").split(";").map(x => parseFloat(x));
		for (let i = 0; i < defs.length; i++) {
			if (Number.isNaN(list[i])) list[i] = defs[i];
		}
		const [x, y, w, h, z] = list;
		return { x, y, w, h, z };
	}
	set crop({ x, y, w, h, z }) {
		this.dataset.crop = [x, y, w, h, z].join(';');
	}
	get image() {
		let img = this.firstElementChild;
		if (!img || !img.matches('img')) {
			img = this.insertBefore(this.ownerDocument.createElement('img'), this.firstChild);
		}
		return img;
	}

	patch(state) {
		this.classList.remove('loading');
		if (this.currentSrc != this.options.src) {
			this.classList.remove('error');
		}
		const d = this.dataset;
		if (d.width == null || d.height == null) {
			const meta = state.scope.$hrefs?.[this.options.src];
			if (meta?.width) d.width = meta.width;
			if (meta?.height) d.height = meta.height;
		}
		d.width ??= this.constructor.defaultWidth || "";
		d.height ??= this.constructor.defaultHeight || "";
		const { w, h } = this.dimensions;
		if (w) this.image.width = w || d.width;
		if (h) this.image.height = h || d.height;
		const cur = this.currentSrc;
		if (!cur) {
			this.placeholder();
		} else if (cur.startsWith('data:')) {
			this.image.setAttribute('src', cur);
		}
	}

	get currentSrc() {
		return this.image?.currentSrc;
	}

	requestSrc(srcLoc) {
		const { crop, fit } = this;
		const { w, h } = this.dimensions;
		const r = {};
		if (!Number.isNaN(w) && !Number.isNaN(h)) {
			if (fit == "none") {
				r.width = w;
				r.height = h;
			} else {
				const rect = this.getBoundingClientRect();
				r.width = rect.width;
				r.height = rect.height;
			}
		}
		if (!r.width && !r.height) {
			// don't show
			return;
		}
		if (crop.x != 50 || crop.y != 50 || crop.w != 100 || crop.h != 100) {
			if (Math.round((crop.x - crop.w / 2) * 100) < 0 || Math.round((crop.x + crop.w / 2) * 100) > 10000) {
				crop.w = 2 * Math.min(crop.x, 100 - crop.x);
			}
			if (Math.round((crop.y - crop.h / 2) * 100) < 0 || Math.round((crop.y + crop.h / 2) * 100) > 10000) {
				crop.h = 2 * Math.min(crop.y, 100 - crop.y);
			}
			srcLoc.query.ex = `x-${crop.x}_y-${crop.y}_w-${crop.w}_h-${crop.h}`;
		}

		if (!r.width) r.width = r.height * w / h;
		if (!r.height) r.height = r.width * h / w;
		const clientHintWidth = Math.ceil(
			(fit == "contain" ? Math.min : Math.max)(r.width / w, r.height / h)
			* w * (window.devicePixelRatio || 1)
		);
		srcLoc.query.rs = `w-${clientHintWidth}`; // max, min ?
		return srcLoc.toString();
	}

	reveal(state) {
		if (!this.options.src) {
			this.placeholder(true);
			return;
		}
		if (this.classList.contains('loading')) {
			return;
		}
		const img = this.image;
		const srcLoc = Page.parse(this.options.src);
		const reqSrc = this.requestSrc(srcLoc);
		if (!reqSrc) {
			img.setAttribute('src', '');
		}	else if (reqSrc != this.currentSrc) {
			this.classList.add('loading');
			this.#defer?.resolve();
			this.#defer = new Deferred();
			img.setAttribute('src', reqSrc);
			return this.#defer;
		}
	}
	captureLoad() {
		this.classList.remove('loading');
		this.#defer?.resolve();
	}
	captureError(e) {
		this.classList.remove('loading');
		this.classList.add('error');
		this.placeholder(true);
		this.#defer?.reject(new Error(this.currentSrc));
	}
	placeholder(error) {
		this.image.removeAttribute('src');
	}
	close() {
		this.#defer?.resolve();
	}
};

const HTMLElementImage = HTMLElementImageConstructor(Page.Element);

class HTMLElementInlineImage extends HTMLElementImageConstructor(Page.create(HTMLImageElement)) {
	static defaults = {
		dataSrc: null,
		dataCrop: null
	};

	get image() {
		return this;
	}

	placeholder(error) {
		if (error) {
			this.image.src = "data:image/svg+xml," + encodeURIComponent(
				`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 ${this.image.width} ${this.image.height}"><text text-anchor="middle" dominant-baseline="central" x="50%" y="50%" fill="#aaa">${error ? '∅' : ''}</text></svg>`);
		} else {
			this.image.removeAttribute('src');
		}
	}

	get currentSrc() {
		const cur = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'currentSrc').get.call(this);
		if (!cur && this.image.src?.startsWith('data:')) return this.src;
		else return cur;
	}

	captureLoad() {
		super.captureLoad();
	}
	captureError(e) {
		super.captureError(e);
	}
}

Page.define('element-image', HTMLElementImage);
Page.define(`element-img`, HTMLElementInlineImage, 'img');
