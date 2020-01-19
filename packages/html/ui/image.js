class HTMLElementImage extends HTMLCustomElement {
	static get defaults() {
		return {
			src: null,
			crop: null
		};
	}
	findClass(list) {
		return list.find(function(name) {
			return this.matches(`.${name}`);
		}, this) || list[0];
	}
	get fit() {
		return this.findClass(['none', 'contain', 'cover']);
	}
	get position() {
		var h = this.findClass(['left', 'hcenter', 'right']);
		var v = this.findClass(['top', 'vcenter', 'bottom']);
		return `${h} ${v}`.trim();
	}
	set fit(val) {
		this.classList.add(val);
	}
	set position(val) {
		(val || '').split(' ').forEach(function(val) {
			if (val) this.classList.add(val);
		}, this);
	}
	get crop() {
		var [x, y, w, h, z] = (this.dataset.crop || ";;;;").split(";").map((x) => parseFloat(x));
		if (isNaN(x)) x = 50;
		if (isNaN(y)) y = 50;
		if (isNaN(w)) w = 100;
		if (isNaN(h)) h = 100;
		if (isNaN(z)) z = 100;
		return {x, y, w, h, z};
	}
	set crop({x, y, w, h, z}) {
		this.dataset.crop = [x, y, w, h, z].join(';');
	}
	get image() {
		var img = this.firstElementChild;
		if (!img || !img.matches('img')) {
			img = this.insertBefore(this.ownerDocument.createElement('img'), this.firstChild);
		}
		return img;
	}

	fix(img) {
		if (!window.objectFitImages.supportsObjectFit) {
			var style = "";
			if (this.fit) {
				style += `object-fit: ${this.fit};`;
			}
			if (this.position) {
				var pos = this.position.replace(/(h|v)center/g, 'center');
				style += `object-position: ${pos};`;
			}
			if (style.length) {
				img.style.fontFamily = `'${style}'`;
				window.objectFitImages(img);
			}
		}
	}
	patch(state) {
		this.classList.remove('error', 'loading');
		var loc = Page.parse(this.options.src);
		var meta = state.scope.$hrefs && state.scope.$hrefs[loc.pathname] || {};
		if (!meta || !meta.width || !meta.height) return;
		var crop = this.crop;
		this.dataset.width = meta.width;
		this.dataset.height = meta.height;
		if (!this.currentSrc) this.placeholder();
	}
	reveal(state) {
		var img = this.image;
		var w = parseInt(this.dataset.width);
		var h = parseInt(this.dataset.height);

		var fit = this.fit;

		var loc = Page.parse(this.options.src);

		if (loc.hostname && loc.hostname != document.location.hostname) {
			loc = {
				pathname: "/.api/image",
				query: {
					url: this.options.src
				}
			};
		}
		var r = this.crop;
		if (r.x != 50 || r.y != 50 || r.w != 100 || r.h != 100) {
			if (Math.round((r.x - r.w / 2)*100) < 0 || Math.round((r.x + r.w / 2)*100) > 10000) {
				r.w = 2 * Math.min(r.x, 100 - r.x);
			}
			if (Math.round((r.y - r.h / 2)*100) < 0 || Math.round((r.y + r.h / 2)*100) > 10000) {
				r.h = 2 * Math.min(r.y, 100 - r.y);
			}
			loc.query.ex = `x-${r.x}_y-${r.y}_w-${r.w}_h-${r.h}`;
		}
		w = w * r.w / 100;
		h = h * r.h / 100;
		if (r.z != 100 && fit == "none") {
			loc.query.rs = `z-${r.z}`;
		} else if (!isNaN(w) && !isNaN(h)) {
			var zoom;
			var rect = this.getBoundingClientRect();
			var rw = rect.width;
			var rh = rect.height;
			if (rw == 0 && rh == 0) {
				// don't show
				return;
			}
			if (rw || rh) {
				if (!rw) rw = rh * w / h;
				if (!rh) rh = rw * h / w;
				zoom = Math.ceil((fit == "contain" ? Math.min : Math.max)(rw / w, rh / h) * 100 * (window.devicePixelRatio || 1));
				// svg need to be resized to scale to its intrinsic dimension
				if (zoom > 100) zoom = 100;
			}
			if (zoom) {
				var zstep = 5;
				zoom = Math.ceil(zoom / zstep) * zstep;
				loc.query.rs = "z-" + zoom;
			}
		}
		var curSrc = Page.format(loc);
		if (curSrc != this.currentSrc) {
			try {
				this.currentSrc = curSrc;
			} catch(e) {
				// pass
			}
			this.classList.add('loading');
			img.setAttribute('src', curSrc);
		}
	}
	captureLoad() {
		this.classList.remove('loading');
		this.fix(this.image);
	}
	captureError() {
		try {
			delete this.currentSrc;
		} catch(e) {
			// pass
		}
		this.classList.remove('loading');
		this.classList.add('error');
		this.placeholder();
	}
	placeholder() {
		var w = this.dataset.width;
		var h = this.dataset.height;
		var r = this.crop;
		if (w && h) {
			w = Math.round(w * r.w / 100);
			h = Math.round(h * r.h / 100);
			this.image.src = "data:image/svg+xml," + encodeURIComponent(
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"></svg>`
			);
		}
	}
}

class HTMLElementInlineImage extends HTMLImageElement {
	get image() {
		return this;
	}
	captureLoad() {
		this.removeAttribute('width');
		this.removeAttribute('height');
		this.classList.remove('loading');
		this.fix(this.image);
	}
	placeholder() {
		var w = this.dataset.width;
		var h = this.dataset.height;
		var r = this.crop;
		if (w && h) {
			w = Math.round(w * r.w / 100);
			h = Math.round(h * r.h / 100);
			this.width = w;
			this.height = h;
		}
	}
}
HTMLElementInlineImage.defaults = HTMLElementImage.defaults;
['patch', 'reveal', 'captureError', 'crop', 'position', 'fit', 'findClass', 'fix'].forEach(function(name) {
	Object.defineProperty(
		HTMLElementInlineImage.prototype,
		name,
		Object.getOwnPropertyDescriptor(HTMLElementImage.prototype, name)
	);
});

HTMLCustomElement.define('element-image', HTMLElementImage);
HTMLCustomElement.define(`element-img`, HTMLElementInlineImage, 'img');
