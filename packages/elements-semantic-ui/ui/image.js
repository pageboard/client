class HTMLElementImage extends HTMLCustomElement {
	init() {
		this.load = this.load.bind(this);
	}
	connectedCallback() {
		if ("IntersectionObserver" in window) {
			this._observer = new IntersectionObserver(function(entries, observer) {
				entries.forEach(function(entry) {
					if (entry.isIntersecting || entry.intersectionRatio > 0) entry.target.reveal();
				});
			}, {
				threshold: 0
			});
			this._observer.observe(this);
		} else {
			this.reveal();
		}

		if (!objectFitImages.supportsObjectFit) {
			var style = "";
			if (this.dataset.fit) {
				style += `object-fit: ${this.dataset.fit};`;
			}
			if (this.dataset.position) {
				style += `object-position: ${this.dataset.position};`;
			}
			if (style.length) {
				this.style.fontFamily = `'${style}'`;
				objectFitImages(this);
			}
		}
	}
	reveal() {
		var img = this.querySelector('img');
		if (!img) return;
		this.disconnectedCallback();
		var src = img.getAttribute('src');
		if (!src || this._revealAt || !img.classList.contains('lqip')) return;
		this._revealAt = Date.now();
		var z = parseFloat(img.dataset.zoom);
		if (isNaN(z)) z = 100;
		var w = parseInt(img.dataset.width);
		var h = parseInt(img.dataset.height);
		var zoom;
		if (!isNaN(w) && !isNaN(h)) {
			var rect = this.parentNode.getBoundingClientRect();
			if (rect.width && rect.height) {
				zoom = Math.round(Math.max(rect.width / w, rect.height / h) * 100);
				// what's the point
				if (Math.abs(zoom - z) < 20 || zoom > 100) zoom = null;
			}
		}
		img.addEventListener('load', this.load, false);
		img.addEventListener('error', this.load, false);
		var loc = Page.parse(src);
		delete loc.query.q;
		if (!zoom) delete loc.query.rs;
		else loc.query.rs = "z-" + zoom;
		src = Page.format(loc);
		img.setAttribute('src', src);
	}
	update() {
		this.reveal();
	}
	load(e) {
		e.target.removeEventListener('load', this.load, false);
		e.target.removeEventListener('error', this.load, false);
		if (Date.now() - this._revealAt > 1000) e.target.classList.add('lqip-reveal');
		e.target.classList.remove('lqip');
	}
	disconnectedCallback() {
		if (this._observer) {
			this._observer.unobserve(this);
			delete this._observer;
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-image', HTMLElementImage);
});
