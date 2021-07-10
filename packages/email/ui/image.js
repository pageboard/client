class HTMLElementMailImage extends HTMLImageElement {
	constructor() {
		super();
		if (this.init) this.init();
	}
	static defaults = {
		dataSrc: null,
		dataCrop: null
	};
	get crop() {
		let [x, y, w, h, z] = (this.dataset.crop || ";;;;").split(";").map((x) => parseFloat(x));
		if (Number.isNaN(x)) x = 50;
		if (Number.isNaN(y)) y = 50;
		if (Number.isNaN(w)) w = 100;
		if (Number.isNaN(h)) h = 100;
		if (Number.isNaN(z)) z = 100;
		return {x, y, w, h, z};
	}
	set crop({x, y, w, h, z}) {
		this.dataset.crop = [x, y, w, h, z].join(';');
	}
	get image() {
		return this;
	}
	patch(state) {
		let loc = Page.parse(this.options.src);
		const meta = state.scope.$hrefs && state.scope.$hrefs[loc.pathname] || {};
		if (!meta || !meta.width || !meta.height) return;
		if (meta.mime == "image/svg+xml") loc.query.format = 'png';

		const img = this.image;
		let w = meta.width;

		if (loc.hostname && loc.hostname != document.location.hostname) {
			loc = {
				pathname: "/.api/image",
				query: {
					url: this.options.src
				}
			};
		}
		const r = this.crop;
		if (r.x != 50 || r.y != 50 || r.w != 100 || r.h != 100) {
			if (Math.round((r.x - r.w / 2) * 100) < 0 || Math.round((r.x + r.w / 2) * 100) > 10000) {
				r.w = 2 * Math.min(r.x, 100 - r.x);
			}
			if (Math.round((r.y - r.h / 2) * 100) < 0 || Math.round((r.y + r.h / 2) * 100) > 10000) {
				r.h = 2 * Math.min(r.y, 100 - r.y);
			}
			loc.query.ex = `x-${r.x}_y-${r.y}_w-${r.w}_h-${r.h}`;
		}
		w = w * r.w / 100;

		let wz = r.z;
		const wide = 580;
		if (w > wide) {
			wz = Math.ceil(100 * wide / w);
		}
		loc.query.rs = "z-" + wz;
		const dloc = document.location;
		const base = dloc.protocol + '//' + dloc.host;
		const url = (new URL(Page.format(loc), base)).href;
		img.setAttribute('src', url);
	}
}

VirtualHTMLElement.define(`element-mail-img`, HTMLElementMailImage, 'img');
