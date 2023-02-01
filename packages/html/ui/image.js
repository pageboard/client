class HTMLElementImage extends VirtualHTMLElement {
	static defaults = {
		src: null,
		crop: null
	};

	static defaultWidth = 240;
	static defaultHeight = 180;

	static getZoom({ w, h, rw, rh, fit }) {
		let z = 100;
		if (!rw && !rh) return z;
		if (!rw) rw = rh * w / h;
		if (!rh) rh = rw * h / w;
		z = Math.ceil((fit == "contain" ? Math.min : Math.max)(rw / w, rh / h) * 100 * (window.devicePixelRatio || 1));
		// svg need to be resized to scale to its intrinsic dimension
		if (z > 100) z = 100;
		const zstep = 5;
		z = Math.ceil(z / zstep) * zstep;
		return z;
	}
	get dimensions() {
		let w = parseInt(this.dataset.width);
		let h = parseInt(this.dataset.height);
		const r = this.crop;
		w = Math.round(w * r.w / 100);
		h = Math.round(h * r.h / 100);
		if (r.z != 100 && this.fit == "none") {
			w = Math.round(w * r.z / 100);
			h = Math.round(h * r.z / 100);
		}
		return { w, h };
	}
	init() {
		this.promise = Promise.resolve();
		this.promise.done = function () { };
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
		let [x, y, w, h, z] = (this.dataset.crop || ";;;;").split(";").map(x => parseFloat(x));
		if (Number.isNaN(x)) x = 50;
		if (Number.isNaN(y)) y = 50;
		if (Number.isNaN(w)) w = 100;
		if (Number.isNaN(h)) h = 100;
		if (Number.isNaN(z)) z = 100;
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

	fix(img) {
		if (!window.objectFitImages.supportsObjectFit) {
			let style = "";
			if (this.fit) {
				style += `object-fit: ${this.fit};`;
			}
			if (this.position) {
				const pos = this.position.replace(/(h|v)center/g, 'center');
				style += `object-position: ${pos};`;
			}
			if (style.length) {
				img.style.fontFamily = `'${style}'`;
				window.objectFitImages(img);
			}
		}
	}
	patch(state) {
		this.classList.remove('loading');
		if (this.currentSrc != this.options.src) {
			this.classList.remove('error');
		}
		this.dataset.width = this.constructor.defaultWidth;
		this.dataset.height = this.constructor.defaultHeight;
		if (this.options.src) {
			const loc = Page.parse(this.options.src);
			const meta = state.scope.$hrefs?.[loc.pathname];
			if (meta) {
				this.dataset.width = meta.width;
				this.dataset.height = meta.height;
			}
		}
		const { w, h } = this.dimensions;
		this.image.width = w || this.dataset.width;
		this.image.height = h || this.dataset.height;
		if (!this.currentSrc) {
			this.placeholder();
		}
	}

	get currentSrc() {
		const src = this.image?.currentSrc;
		if (src?.startsWith('data:image/svg')) return null;
		else return src;
	}

	reveal(state) {
		const img = this.image;
		if (!this.options.src) {
			this.placeholder(true);
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
		const { w, h } = this.dimensions;
		if (fit == "none") {
			loc.query.rs = `z-${r.z}`;
		} else if (!Number.isNaN(w) && !Number.isNaN(h)) {
			const rect = this.getBoundingClientRect();
			const rw = rect.width;
			const rh = rect.height;
			if (rw == 0 && rh == 0) {
				// don't show
				return this.promise;
			}
			loc.query.rs = "z-" + HTMLElementImage.getZoom({ w, h, rw, rh, fit });
		}
		const curSrc = loc.toString();
		if (curSrc != this.currentSrc) {
			this.classList.add('loading');
			let done;
			this.promise = new Promise(resolve => done = resolve);
			this.promise.done = done;
			img.setAttribute('src', curSrc);
		}
		return this.promise;
	}
	captureLoad() {
		this.promise?.done();
		this.classList.remove('loading');
		this.fix(this.image);
	}
	captureError() {
		this.promise?.done();
		this.classList.remove('loading');
		this.classList.add('error');
		this.placeholder(true);
	}
	placeholder(error) {
		this.image.removeAttribute('src');
	}
}

class HTMLElementInlineImage extends HTMLImageElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataSrc: null,
		dataCrop: null
	};

	static defaultWidth = 40;
	static defaultHeight = 30;

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
		const cur = super.currentSrc;
		if (!cur && this.image.src?.startsWith('data:')) return this.src;
		else return cur;
	}
}

VirtualHTMLElement.inherits(HTMLElementInlineImage, HTMLElementImage);
VirtualHTMLElement.define('element-image', HTMLElementImage);
VirtualHTMLElement.define(`element-img`, HTMLElementInlineImage, 'img');
