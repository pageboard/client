class HTMLElementImage extends HTMLCustomElement {
	init() {
		this.load = this.load.bind(this);
	}
	connectedCallback() {
		this._observer = new IntersectionObserver(function(entries, observer) {
			entries.forEach(function(entry) {
				if (!entry.isIntersecting) return;
				entry.target.reveal();
			});
		}, {
			threshold: 0.006
		});
		this._observer.observe(this);

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
		img.addEventListener('load', this.load, false);
		img.addEventListener('error', this.load, false);
		if (img.dataset.srcset) {
			img.srcset = img.dataset.srcset;
			delete img.dataset.srcset;
		}
		if (img.dataset.src) {
			img.src = img.dataset.src;
			delete img.dataset.src;
		}
		this.disconnectedCallback();
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
