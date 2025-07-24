Pageboard.schemaHelpers.crop = class Crop {
	constructor(input, opts, props, parentProp) {
		this.input = input;
		this.props = props;
		this.prefix = input.name.split('.').slice(0, -1).join('.');
		if (this.prefix) {
			this.prefix += ".";
		}
		let urlProp = "url";
		if (parentProp) {
			urlProp = Object.keys(parentProp).find(key => {
				const pp = parentProp[key].$helper;
				if (pp?.name == "href" && (pp.filter?.type ?? []).includes('image')) {
					return true;
				} else {
					return false;
				}
			});
		}
		this.urlProp = this.prefix + urlProp;
	}
	init(block) {
		const input = this.input;
		this.x = input.querySelector(`[name="${this.prefix}crop.x"]`);
		this.y = input.querySelector(`[name="${this.prefix}crop.y"]`);
		this.width = input.querySelector(`[name="${this.prefix}crop.width"]`);
		this.height = input.querySelector(`[name="${this.prefix}crop.height"]`);
		this.zoom = input.querySelector(`[name="${this.prefix}crop.zoom"]`);

		input.classList.add('crop');

		this.reset = this.reset.bind(this);
		this.zoomIn = this.zoomIn.bind(this);
		this.zoomOut = this.zoomOut.bind(this);
		this.formChange = this.formChange.bind(this);
		this.zoomChange = this.zoomChange.bind(this);
		this.valueChange = this.valueChange.bind(this);
		this.valueFocus = this.valueFocus.bind(this);

		this.debouncedChange = Page.debounce(obj => this.change(obj), 500);

		this.block = block;

		this.container = input.appendChild(input.dom(`<div class="crop">
			<img src="${this.thumbnail(this.getField(this.urlProp))}" />
		</div>`));

		this.cropper = new Pageboard.utils.Cropper(this.container.querySelector('img'), {
			viewMode: 1,
			zoomOnTouch: false,
			zoomOnWheel: false,
			scalable: true,
			rotatable: false,
			autoCropArea: 1,
			minContainerWidth: this.container.offsetWidth,
			minContainerHeight: this.container.offsetWidth * 3 / 4,
			dragMode: 'move',
			checkOrientation: false,
			checkCrossOrigin: false,
			toggleDragModeOnDblclick: false,
			responsive: false,
			ready: () => {
				this.ready();
			},
			crop: (e) => {
				if (!e.detail) return;
				this.updateCrop(e.detail);
				this.debouncedChange(e.detail);
			}
		});

		this.initControls();

		this.input.closest('form').addEventListener('change', this.formChange, false);
	}
	ready() {
		if (!this.cropper) return;
		this.updateData();
	}

	formChange(e) {
		if (!e.target.matches(`[name="${this.urlProp}"]`)) return;
		setTimeout(() => this.load());
	}

	reset() {
		this.cropper.reset();
	}

	zoomIn() {
		this.cropper.zoom(0.1);
	}

	zoomOut() {
		this.cropper.zoom(-0.1);
	}

	initControls() {
		const doc = this.input.ownerDocument;

		const btnCont = this.container.appendChild(doc.dom(`<div class="bottom-buttons"></div>`));
		this.resetButton = btnCont.appendChild(doc.dom(`<div class="mini ui basic inverted circular icon button">
			<i class="arrows alternate icon"></i>
		</div>`));
		this.zoomOutButton = btnCont.appendChild(doc.dom(`<div class="ui mini basic inverted circular icon button out">
			<i class="compress arrows alternate icon"></i>
		</div>`));
		this.zoomInButton = btnCont.appendChild(doc.dom(`<div class="ui mini basic inverted circular icon button in">
			<i class="expand arrows alternate icon"></i>
		</div>`));

		this.resetButton.addEventListener('click', this.reset, false);
		this.zoomOutButton.addEventListener('click', this.zoomOut, false);
		this.zoomInButton.addEventListener('click', this.zoomIn, false);

		const zoomProp = this.props.properties.zoom;

		this.slider = this.container.appendChild(doc.dom(`<div class="slider">
			<input type="range" step="0.0001" min="${zoomProp.minimum / 100}" max="${zoomProp.maximum / 100}">
		</div>`));

		this.sliderValue = this.slider.appendChild(doc.dom(`<textarea class="values"></textarea>`));
		this.slider.addEventListener('input', this.zoomChange, false);
		this.sliderValue.addEventListener('input', this.valueChange, false);
		this.sliderValue.addEventListener('focus', this.valueFocus, false);
	}

	valueChange() {
		const txt = this.sliderValue.value;
		// try to parse this
		if (!txt) return;
		const crop = {};
		let fail = false;
		const arr = txt.split(/\s+/);
		for (let i = 0; i < arr.length; i++) {
			const parts = arr[i].split(':');
			const key = parts[0];
			const val = parseFloat(parts[1]);
			if (Number.isNaN(val)) {
				fail = true;
				break;
			}
			if (crop.x == null && key == "x") {
				crop.x = val;
			} else if (crop.y == null && key == "y") {
				crop.y = val;
			} else if (crop.width == null && key == "w") {
				crop.width = val;
			} else if (crop.height == null && key == "h") {
				crop.height = val;
			} else if (crop.zoom == null && key == "z") {
				crop.zoom = val;
			} else {
				fail = true;
				break;
			}
		}
		if (!fail) this.cropper.setData(this.from(crop));
	}

	valueFocus() {
		this.sliderValue.select();
	}

	updateCrop(obj) {
		if (!this.cropper) return;
		const crop = this.to(obj);
		this.sliderValue.value = `x:${crop.x} y:${crop.y} w:${crop.width} h:${crop.height} z:${crop.zoom}`;
		this.slider.querySelector('input').value = obj.scaleX;
	}

	zoomChange(e) {
		this.cropper.scale(e.target.value);
	}

	round(num) {
		return Math.round(1000 * num) / 1000;
	}

	to(obj) {
		const imgData = this.cropper.getImageData();
		const W = imgData.naturalWidth * obj.scaleX;
		const H = imgData.naturalHeight * obj.scaleY;
		const crop = {};

		const x = 100 * (obj.x + obj.width / 2) / W;
		if (!Number.isNaN(x)) crop.x = this.round(x);
		else crop.x = 50;

		const y = 100 * (obj.y + obj.height / 2) / H;
		if (!Number.isNaN(y)) crop.y = this.round(y);
		else crop.y = 50;

		const w = 100 * obj.width / W || 100;
		if (!Number.isNaN(w)) crop.width = this.round(w);
		else crop.width = 100;

		const h = 100 * obj.height / H || 100;
		if (!Number.isNaN(h)) crop.height = this.round(h);
		else crop.height = 100;

		const z = 100 * obj.scaleX;
		if (!Number.isNaN(z)) crop.zoom = this.round(z);
		else crop.zoom = 100;
		return crop;
	}

	change(obj) {
		if (!this.cropper || !obj) return;
		const crop = this.to(obj);
		for (const [key, val] of Object.entries(crop)) {
			this[key].value = val;
		}

		Pageboard.trigger(this.input, 'change');
	}

	load() {
		const url = this.getField(this.urlProp);
		this.container.parentNode.hidden = !url;
		const thumb = this.thumbnail(url);
		// FIXME first call won't properly be shown see below if (this.cropper.url != thumb)
		this.cropper.replace(thumb);
	}

	thumbnail(url) {
		if (url) url += '?rs=w-512_h-512_max&q=65';
		else url = document.body.dataset.placeholder;
		return url;
	}

	from(crop) {
		const imgData = this.cropper.getImageData();
		if (!imgData || !imgData.naturalWidth || !imgData.naturalHeight) return;
		const ratio = (crop.zoom || 100) / 100;
		const W = imgData.naturalWidth * ratio;
		const H = imgData.naturalHeight * ratio;
		return {
			x: (crop.x - crop.width / 2) * W / 100,
			y: (crop.y - crop.height / 2) * H / 100,
			width: crop.width * W / 100,
			height: crop.height * H / 100,
			scaleX: ratio,
			scaleY: ratio
		};
	}

	getField(prop, block) {
		return Pageboard.Semafor.findPath((block ?? this.block).data, prop);
	}

	updateData() {
		const data = this.from(this.getField(this.prefix + 'crop') ?? {});
		if (data) this.cropper.setData(data);
	}

	update(block) {
		// FIXME cropperjs does not support being called without being visible
		// however update(block) is called once.
		const curData = this.getField(this.prefix + 'crop');
		const curUrl = this.getField(this.urlProp);
		const newData = this.getField(this.prefix + 'crop', block);
		const newUrl = this.getField(this.urlProp, block);
		this.block = block;
		if (!this.cropper || newUrl != curUrl) {
			this.load();
		} else if (Pageboard.utils.stableStringify(curData) != Pageboard.utils.stableStringify(newData)) {
			this.updateData();
		}
	}

	destroy() {
		this.cropper.destroy();
		delete this.cropper;
		this.slider.removeEventListener('input', this.zoomChange, false);
		this.sliderValue.removeEventListener('input', this.valueChange, false);
		this.sliderValue.removeEventListener('focus', this.valueFocus, false);
		const form = this.input.closest('form');
		if (form) form.removeEventListener('change', this.formChange, false);
		this.resetButton.removeEventListener('click', this.reset, false);
		this.zoomOutButton.removeEventListener('click', this.zoomOut, false);
		this.zoomInButton.removeEventListener('click', this.zoomIn, false);
		this.container.remove();
		delete this.container;
	}

};
