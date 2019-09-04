class HTMLElementImage extends HTMLCustomElement {
	static get observedAttributes() {
		return ['url', 'reveal'];
	}
	static init() {
		var me = this;
		if ("IntersectionObserver" in window) {
			me.observer = new IntersectionObserver(function(entries, observer) {
				entries.forEach(function(entry) {
					var target = entry.target;
					if (entry.isIntersecting || entry.intersectionRatio > 0) {
						me.unobserve(target);
						Page.setup(target);
					}
				});
			}, {
				threshold: 0
			});
		}
	}
	static observe(el) {
		if (this.observer) {
			if (!el.observed && !el.revealed) {
				el.observed = true;
				this.observer.observe(el);
				return true;
			}
		}
	}
	static unobserve(el) {
		if (this.observer) {
			el.observed = false;
			this.observer.unobserve(el);
		}
	}
	findClass(list) {
		return list.find(function(name) {
			return this.matches(`.${name}`);
		}, this) || list[0];
	}
	get fit() {
		return this.findClass(['none', 'natural', 'contain']);
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
	get width() {
		return parseInt(this.getAttribute('width'));
	}
	get height() {
		return parseInt(this.getAttribute('height'));
	}
	get zoom() {
		var z = parseFloat(this.getAttribute('zoom'));
		if (isNaN(z)) z = 100;
		return z;
	}
	get lazyload() {
		return this.getAttribute('lazyload');
	}
	get url() {
		return this.getAttribute('url');
	}

	attributeChangedCallback(name, old, val) {
		if (name == "url" && old != val) {
			if (this.lazyload != "lazy" || this.revealed) this.show();
		}
	}
	close() {
		this.constructor.unobserve(this);
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
	show() {
		var img = this.firstElementChild;
		if (!img || !img.matches('img')) {
			img = this.ownerDocument.createElement('img');
			this.insertBefore(img, this.firstChild);
		}
		var z = this.zoom;
		var w = this.width;
		var h = this.height;
		var zoom;
		if (!isNaN(w) && !isNaN(h)) {
			var rect = this.parentNode.getBoundingClientRect();
			var rw = rect.width;
			var rh = rect.height;
			if (rw == 0 && rh == 0) {
				// don't show
				return;
			}

			if (rw || rh) {
				if (!rw) rw = rh * w / h;
				if (!rh) rh = rw * h / w;
				zoom = Math.round(Math.max(rw / w, rh / h) * 100);
				// what's the point
				if (zoom > 100) zoom = null;
				else if (z < zoom && zoom < z + 10) zoom = z;
			}
		}
		this.revealed = Date.now();
		var loc = Page.parse(this.url);
		delete loc.query.q;
		if (!zoom) {
			delete loc.query.rs;
		} else {
			zoom = Math.ceil(zoom / 10) * 10;
			loc.query.rs = "z-" + zoom;
		}
		img.setAttribute('src', Page.format(loc));
	}

	patch() {
		if (this.lazyload != "lazy" && !this.revealed) {
			this.show();
		}
	}

	setup() {
		if (!this.constructor.observe(this)) {
			this.show();
		} else if (!this.revealed) {
			this.classList.add(this.lazyload);
			this.show();
		}
	}
	captureLoad() {
		var rev = this.revealed;
		if (!rev) return;
		var img = this.firstElementChild;
		if (rev && Date.now() - rev > 500) {
			this.classList.add('reveal');
		}
		this.classList.remove('lqip', 'lazy');
		this.fix(img);
	}
	captureError() {
		this.classList.remove('lqip', 'lazy');
		this.classList.add('error');
	}
}

Page.ready(function() {
	HTMLCustomElement.define('element-image', HTMLElementImage);
});
