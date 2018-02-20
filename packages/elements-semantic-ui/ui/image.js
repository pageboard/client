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
				threshold: 0.006
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
		if (!img.classList.contains('lqip')) return;
		img.addEventListener('load', this.load, false);
		img.addEventListener('error', this.load, false);
		var reg = /q=\d+&?|&q=\d+/g;
		var srcset = img.getAttribute('srcset');
		if (srcset) {
			img.setAttribute('srcset', srcset.replace(reg, ''));
		}
		var src = img.getAttribute('src');
		if (src) {
			img.setAttribute('src', src.replace(reg, ''));
		}
	}
	update() {
		this.reveal();
	}
	load(e) {
		e.target.removeEventListener('load', this.load, false);
		e.target.removeEventListener('error', this.load, false);
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
	window.customElements.define('element-image', HTMLElementImage);
});
