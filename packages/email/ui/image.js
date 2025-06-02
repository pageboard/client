class HTMLElementMailImage extends Page.create(HTMLImageElement) {
	static defaults = {
		dataSrc: null,
		dataCrop: null,
		dataWidth: x => parseInt(x) || 0,
		dataHeight: x => parseInt(x) || 0,
	};

	static defaultWidth = 240;
	static defaultHeight = 180;

	#defer;

	get image() {
		return this;
	}
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

	patch() {
		const {
			dataset: d,
			image,
			dimensions: { w, h },
			constructor,
			currentSrc: src
		} = this;
		this.classList.remove('loading');
		if (src != this.options.src) {
			this.classList.remove('error');
		}

		d.width ??= constructor.defaultWidth || "";
		d.height ??= constructor.defaultHeight || "";
		image.width = w || d.width;
		image.height = h || d.height;
		image.alt = d.alt ?? "";
		if (!src) {
			this.placeholder();
		} else if (src.startsWith('data:')) {
			image.setAttribute('src', src);
		}
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
				const { clientWidth, clientHeight } = this.offsetParent ?? {};
				r.width = clientWidth;
				r.height = clientHeight;
			}
		}
		if (this.classList.toggle("no-size", !r.width && !r.height)) {
			// Image container must have dimensions
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
		const { src } = this.options;
		if (!src) {
			this.placeholder("Empty image");
			return;
		}
		if (this.classList.contains('loading')) {
			return;
		}
		const img = this.image;
		const srcLoc = Page.parse(src);
		// This cannot be done by changing Accept like with a pdf because the URL is sent in the email
		if (this.dataset.mime == "image/svg+xml") srcLoc.query.format = 'png';
		const reqSrc = this.requestSrc(srcLoc);
		if (!reqSrc) {
			img.setAttribute('src', '');
		} else if (reqSrc != this.currentSrc) {
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
		this.placeholder(this.options.src);
	}
	placeholder(src) {
		this.image.removeAttribute('src');
		if (src) this.#defer?.reject(new Error(src));
	}
	close() {
		this.#defer?.resolve();
	}
}

Page.define(`element-mail-img`, HTMLElementMailImage, 'img');
