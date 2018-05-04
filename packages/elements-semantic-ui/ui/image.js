class HTMLElementImage extends HTMLCustomElement {
	static init() {
		var me = this;
		if ("IntersectionObserver" in window) {
			me.observer = new IntersectionObserver(function(entries, observer) {
				entries.forEach(function(entry) {
					var target = entry.target;
					if (entry.isIntersecting || entry.intersectionRatio > 0) {
						me.unobserve(target);
						target.reveal();
					}
				});
			}, {
				threshold: 0
			});
		}
	}
	static observe(el) {
		if (this.observer) {
			this.observer.observe(el);
		} else {
			el.reveal();
			Page.patch(function() {
				el.reveal();
			});
			Page.setup(function() {
				el.reveal();
			});
		}
	}
	static unobserve(el) {
		if (this.observer) {
			this.observer.unobserve(el);
		} else {
			// TODO
		}
	}
	connectedCallback() {
		this.addEventListener('load', this.load, true);
		this.addEventListener('error', this.error, true);
		this.constructor.observe(this);
	}
	fix(img) {
		if (!objectFitImages.supportsObjectFit) {
			var style = "";
			if (this.dataset.fit) {
				style += `object-fit: ${this.dataset.fit};`;
			}
			if (this.dataset.position) {
				style += `object-position: ${this.dataset.position};`;
			}
			if (style.length) {
				img.style.fontFamily = `'${style}'`;
				objectFitImages(img);
			}
		}
	}
	reveal(force) {
		var img = this.querySelector('img');
		if (!img) return;

		var src = img.getAttribute('src');
		var lazy = !src && this.dataset.url;
		var lqip = this.dataset.lqip != null;
		if (!lazy && !lqip) return;

		if (!force && this._revealAt) {
			return;
		}

		if (lazy) {
			this.classList.add('lazy');
			src = this.dataset.url;
		} else if (lqip) {
			this.classList.add('lqip');
		}

		var z = parseFloat(img.dataset.zoom);
		if (isNaN(z)) z = 100;
		var w = parseInt(img.dataset.width);
		var h = parseInt(img.dataset.height);
		var zoom;
		if (!isNaN(w) && !isNaN(h)) {
			var rect = this.parentNode.getBoundingClientRect();
			var rw = rect.width;
			var rh = rect.height;
			if (rw == 0 && rh == 0) {
				return;
			}

			if (rw || rh) {
				if (!rw) rw = rh * w / h;
				if (!rh) rh = rw * h / w;
				zoom = Math.round(Math.max(rw / w, rh / h) * 100);
				// what's the point
				if (zoom > 100) zoom = null;
				else if (!isNaN(z) && z < zoom && zoom < z + 10) zoom = z;
			}
		}
		this._revealAt = Date.now();
		var loc = Page.parse(src);
		delete loc.query.q;
		if (!zoom) {
			delete loc.query.rs;
		} else {
			zoom = Math.ceil(zoom / 10) * 10;
			loc.query.rs = "z-" + zoom;
		}
		src = Page.format(loc);
		img.setAttribute('src', src);
	}
	update() {
		this.reveal(true);
	}
	load() {
		if (!this.matches('.lqip,.lazy')) return;
		var img = this.querySelector('img');
		var rev = this._revealAt;
		if (rev && Date.now() - rev > 500) {
			if (this.dataset.lqip != null) {
				this.classList.add('lqip-reveal');
			}
			if (this.classList.contains('lazy')) {
				this.classList.add('lazy-reveal');
			}
		}
		this.classList.remove('lqip', 'lazy');
		this.fix(img);
	}
	error() {
		this.classList.remove('lqip', 'lazy');
		this.classList.add('error');
	}
	disconnectedCallback() {
		this.constructor.unobserve(this);
		this.removeEventListener('load', this.load, true);
		this.removeEventListener('error', this.error, true);
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-image', HTMLElementImage);
});
