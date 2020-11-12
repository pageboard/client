(function(Pageboard) {
Pageboard.schemaHelpers.crop = Crop;

function Crop(input, opts, props, parentProp) {
	this.input = input;
	this.props = props;
	this.prefix = input.name.split('.').slice(0, -1).join('.');
	if (this.prefix) {
		this.prefix += ".";
	}
	var urlProp = "url";
	if (parentProp) {
		urlProp = Object.keys(parentProp).find((key) => {
			var pp = parentProp[key].$helper;
			if (!pp) return;
			if (pp.name == "href" && pp.filter && (pp.filter.type || []).includes('image')) {
				return true;
			}
		});
	}
	this.urlProp = this.prefix + urlProp;
}

Crop.prototype.init = function(block) {
	var input = this.input;
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

	this.debouncedChange = Pageboard.debounce(this.change, 500);

	this.container = input.appendChild(input.dom(`<div class="crop">
		<img src="${this.thumbnail(Semafor.findPath(block.data, this.urlProp))}" />
	</div>`));

	this.cropper = new window.Cropper(this.container.querySelector('img'), {
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
		ready: this.ready.bind(this),
		crop: function(e) {
			if (!e.detail) return;
			this.updateCrop(e.detail);
			this.debouncedChange(e.detail);
		}.bind(this)
	});

	this.initControls();

	this.input.closest('#form').addEventListener('change', this.formChange, false);
};

Crop.prototype.ready = function() {
	if (!this.cropper) return;
	this.updateData();
};

Crop.prototype.formChange = function(e) {
	if (!e.target.matches(`[name="${this.urlProp}"]`)) return;
	setTimeout(function() {
		this.load();
	}.bind(this));
};

Crop.prototype.reset = function() {
	this.cropper.reset();
};

Crop.prototype.zoomIn = function() {
	this.cropper.zoom(0.1);
};

Crop.prototype.zoomOut = function() {
	this.cropper.zoom(-0.1);
};

Crop.prototype.initControls = function() {
	var doc = this.input.ownerDocument;

	var btnCont = this.container.appendChild(doc.dom(`<div class="bottom-buttons"></div>`));
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

	var zoomProp = this.props.properties.zoom;

	this.slider = this.container.appendChild(doc.dom(`<div class="slider">
		<input type="range" step="0.0001" min="${zoomProp.minimum / 100}" max="${zoomProp.maximum / 100}">
	</div>`));

	this.sliderValue = this.slider.appendChild(doc.dom(`<textarea class="values"></textarea>`));
	this.slider.addEventListener('input', this.zoomChange, false);
	this.sliderValue.addEventListener('input', this.valueChange, false);
	this.sliderValue.addEventListener('focus', this.valueFocus, false);
};

Crop.prototype.valueChange = function() {
	var txt = this.sliderValue.value;
	// try to parse this
	if (!txt) return;
	var crop = {};
	var fail = false;
	var arr = txt.split(/\s+/);
	for (var i = 0; i < arr.length; i++) {
		var parts = arr[i].split(':');
		var key = parts[0];
		var val = parseFloat(parts[1]);
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
};

Crop.prototype.valueFocus = function() {
	this.sliderValue.select();
};

Crop.prototype.updateCrop = function(obj) {
	if (!this.cropper) return;
	var crop = this.to(obj);
	this.sliderValue.value = `x:${crop.x} y:${crop.y} w:${crop.width} h:${crop.height} z:${crop.zoom}`;
	this.slider.querySelector('input').value = obj.scaleX;
};

Crop.prototype.zoomChange = function(e) {
	this.cropper.scale(e.target.value);
};

Crop.prototype.round = function(num) {
	return Math.round(1000 * num) / 1000;
};

Crop.prototype.to = function(obj) {
	var imgData = this.cropper.getImageData();
	var W = imgData.naturalWidth * obj.scaleX;
	var H = imgData.naturalHeight * obj.scaleY;
	var crop = {};

	var x = 100 * (obj.x + obj.width / 2) / W;
	if (!isNaN(x)) crop.x = this.round(x);

	var y = 100 * (obj.y + obj.height / 2) / H;
	if (!isNaN(y)) crop.y = this.round(y);

	var w = 100 * obj.width / W;
	if (!isNaN(w)) crop.width = this.round(w);

	var h = 100 * obj.height / H;
	if (!isNaN(h)) crop.height = this.round(h);

	var z = 100 * obj.scaleX;
	if (!isNaN(z)) crop.zoom = this.round(z);
	return crop;
};

Crop.prototype.change = function(obj) {
	if (!this.cropper || !obj) return;
	var crop = this.to(obj);
	Object.keys(crop).forEach(function(key) {
		this[key].value = crop[key];
	}, this);

	Pageboard.trigger(this.input, 'change');
};

Crop.prototype.load = function() {
	var url = this.block.data.url;
	if (url == this.lastUrl) return this.cropper && this.cropper.cropped;
	this.lastUrl = url;

	this.cropper.replace(this.thumbnail(url));
	return false;
};

Crop.prototype.thumbnail = function(url) {
	if (url) url += '?rs=w-512_h-512_max&q=65';
	else url = document.body.dataset.placeholder;
	return url;
};

Crop.prototype.from = function(crop) {
	var imgData = this.cropper.getImageData();
	var ratio = (crop.zoom || 100) / 100;
	var W = imgData.naturalWidth * ratio;
	var H = imgData.naturalHeight * ratio;
	return {
		x: (crop.x - crop.width / 2) * W / 100,
		y: (crop.y - crop.height / 2) * H / 100,
		width: crop.width * W / 100,
		height: crop.height * H / 100,
		scaleX: ratio,
		scaleY: ratio
	};
};

Crop.prototype.updateData = function() {
	var data = this.block.data.crop || {};
	this.cropper.setData(this.from(data));
};

Crop.prototype.update = function(block) {
	this.block = block;
	if (this.load()) {
		this.updateData();
	}
};

Crop.prototype.destroy = function() {
	this.cropper.destroy();
	delete this.cropper;
	this.slider.removeEventListener('input', this.zoomChange, false);
	this.sliderValue.removeEventListener('input', this.valueChange, false);
	this.sliderValue.removeEventListener('focus', this.valueFocus, false);
	var form = this.input.closest('#form');
	if (form) form.removeEventListener('change', this.formChange, false);
	this.resetButton.removeEventListener('click', this.reset, false);
	this.zoomOutButton.removeEventListener('click', this.zoomOut, false);
	this.zoomInButton.removeEventListener('click', this.zoomIn, false);
	this.container.remove();
	delete this.container;
};

})(window.Pageboard);
