class HTMLElementImage extends HTMLCustomElement {
	static get defaults() {
		return {
			src: null,
			loading: null
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
	get zoom() {
		var z = parseFloat(this.getAttribute('zoom'));
		if (isNaN(z)) z = 100;
		return z;
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
	patch() {
		var img = this.firstElementChild;
		if (!img || !img.matches('img')) {
			img = this.insertBefore(this.ownerDocument.createElement('img'), this.firstChild);
		}
		this.classList.remove('error', 'loading');
		img.setAttribute('width', this.getAttribute('width'));
		img.setAttribute('height', this.getAttribute('height'));
		if (!this.currentSrc) this.placeholder();
	}
	reveal() {
		var img = this.firstElementChild;
		var w = parseInt(this.getAttribute('width'));
		var h = parseInt(this.getAttribute('height'));
		var zoom;
		if (!isNaN(w) && !isNaN(h)) {
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
				zoom = Math.round((this.fit == "cover" ? Math.max : Math.min)(rw / w, rh / h) * 100 * (window.devicePixelRatio || 1));
				// svg need to be resized to scale to its intrinsic dimension
				if (zoom > 100) zoom = 100;
			}
		}
		var loc = Page.parse(this.options.src);
		delete loc.query.q;
		if (zoom) {
			var zstep = zoom > 15 ? 10 : 5;
			zoom = Math.ceil(zoom / zstep) * zstep;
			loc.query.rs = "z-" + zoom;
		}
		var curSrc = this.currentSrc = Page.format(loc);
		this.classList.add('loading');
		img.setAttribute('src', curSrc);
	}
	captureLoad() {
		this.classList.remove('loading');
		this.fix(this.firstElementChild);
	}
	captureError() {
		this.classList.add('error');
		this.placeholder();
	}
	placeholder() {
		var img = this.firstElementChild;
		var w = img.getAttribute('width');
		var h = img.getAttribute('height');
		if (w && h) {
			img.src = "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"></svg>`);
		}
	}
}


HTMLCustomElement.define('element-image', HTMLElementImage);

