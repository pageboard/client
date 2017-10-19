(function(Pageboard) {
Pageboard.inputs.crop = Crop;

function Crop(input, opts, props, block) {
	this.input = input;
	this.block = block;

	this.x = input.querySelector('[name="crop.x"]');
	this.y = input.querySelector('[name="crop.y"]');
	this.width = input.querySelector('[name="crop.width"]');
	this.height = input.querySelector('[name="crop.height"]');
	this.zoom = input.querySelector('[name="crop.zoom"]');

	input.classList.add('crop');

	this.reset = this.reset.bind(this);
	this.zoomIn = this.zoomIn.bind(this);
	this.zoomOut = this.zoomOut.bind(this);
	this.formChange = this.formChange.bind(this);
	this.zoomChange = this.zoomChange.bind(this);
	this.valueChange = this.valueChange.bind(this);
	this.valueFocus = this.valueFocus.bind(this);

	this.debouncedChange = Pageboard.Debounce(this.change.bind(this), 500);

	this.container = input.appendChild(input.dom`<div class="crop">
		<img src="${this.thumbnail(this.block.data.url)}" />
	</div>`);

	this.cropper = new Cropper(this.container.querySelector('img'), {
		viewMode: 1,
		zoomOnTouch: false,
		zoomOnWheel: false,
		dragMode: 'move',
		toggleDragModeOnDblclick: false,
		ready: this.ready.bind(this),
		crop: function(e) {
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
	if (!e.target.matches('[name="url"]')) return;
	setTimeout(function() {
		this.load();
	}.bind(this));
};

Crop.prototype.reset = function() {
	this.cropper.reset();
	this.cropper.scale(1, 1);
};

Crop.prototype.zoomIn = function() {
	this.cropper.zoom(0.1);
};

Crop.prototype.zoomOut = function() {
	this.cropper.zoom(-0.1);
};

Crop.prototype.initControls = function() {
	var doc = this.input.ownerDocument;

	var btnCont = this.container.appendChild(doc.dom`<div class="bottom-buttons"></div>`);
	this.zoomOutButton = btnCont.appendChild(doc.dom`<div class="ui mini basic inverted circular icon button left">
		<i class="compress icon"></i>
	</div>`);
	this.zoomInButton = btnCont.appendChild(doc.dom`<div class="ui mini basic inverted circular icon button right">
		<i class="expand icon"></i>
	</div>`);
	this.zoomOutButton.addEventListener('click', this.zoomOut, false);
	this.zoomInButton.addEventListener('click', this.zoomIn, false);

	this.slider = this.container.appendChild(doc.dom`<div class="slider">
		<input type="range" step="0.0001" min="0.01" max="2.00">
	</div>`);

	this.sliderValue = this.slider.appendChild(doc.dom`<textarea class="values"></textarea>`);
	this.slider.addEventListener('input', this.zoomChange, false);
	this.sliderValue.addEventListener('input', this.valueChange, false);
	this.sliderValue.addEventListener('focus', this.valueFocus, false);

	this.resetButton = this.slider.appendChild(doc.dom`<div class="mini ui basic icon button">
		<i class="compress icon"></i>
	</div>`);
	this.resetButton.addEventListener('click', this.reset, false);
};

Crop.prototype.valueChange = function() {
	var txt = this.sliderValue.value;
	// try to parse this
	if (!txt) return;
	var box = {};
	var ratio = null;
	var fail = false;
	var arr = txt.split(/\s+/);
	for (var i=0; i < arr.length; i++) {
		var parts = arr[i].split(':');
		var key = parts[0];
		var val = parseFloat(parts[1]);
		if (isNaN(val)) {
			fail = true;
			break;
		}
		if (box.x == null && key == "x") {
			box.x = val;
		} else if (box.y == null && key == "y") {
			box.y = val;
		} else if (box.width == null && key == "w") {
			box.width = val;
		} else if (box.height == null && key == "h") {
			box.height = val;
		} else if (ratio == null && key == "zoom") {
			ratio = val / 100;
		} else {
			fail = true;
			break;
		}
	}
	if (!fail) this.cropper.scale(ratio, ratio).setData(box);
};

Crop.prototype.valueFocus = function() {
	this.sliderValue.select();
};

Crop.prototype.updateCrop = function(obj) {
	if (!this.cropper) return;
	this.sliderValue.value = `x:${this.round(obj.x)} y:${this.round(obj.y)} w:${this.round(obj.width)} h:${this.round(obj.height)} zoom:${this.round(obj.scaleX * 100)}`;
	this.slider.querySelector('input').value = obj.scaleX;
};

Crop.prototype.zoomChange = function(e) {
	this.cropper.scale(e.target.value);
};

Crop.prototype.round = function(num) {
	return Math.round(1000 * num) / 1000;
};

Crop.prototype.change = function(obj) {
	if (!this.cropper) return;
	var imgData = this.cropper.getImageData();
	var W = imgData.naturalWidth * obj.scaleX;
	var H = imgData.naturalHeight * obj.scaleY;

	var x = 100 * (obj.x + obj.width / 2) / W;
	if (!isNaN(x)) this.x.value = this.round(x);

	var y = 100 * (obj.y + obj.height / 2) / H;
	if (!isNaN(y)) this.y.value = this.round(y);

	var w = 100 * obj.width / W;
	if (!isNaN(w)) this.width.value = this.round(w);

	var h = 100 * obj.height / H;
	if (!isNaN(h)) this.height.value = this.round(h);

	var z = 100 * obj.scaleX;
	if (!isNaN(z)) this.zoom.value = this.round(z);

	Pageboard.trigger(this.input, 'change');
};

Crop.prototype.load = function() {
	var url = this.block.data.url;
	if (url == this.lastUrl) return this.cropper.complete;
	this.lastUrl = url;

	this.cropper.replace(this.thumbnail(url));
	return false;
};

Crop.prototype.thumbnail = function(url) {
	if (url) url += '?rs=w:512&q=65';
	else url = '/.files/@pageboard/elements/ui/placeholder.png';
	return url;
};

Crop.prototype.updateData = function() {
	var data = this.block.data.crop || {};

	var imgData = this.cropper.getImageData();
	var ratio = data.zoom / 100;
	var W = imgData.naturalWidth * ratio;
	var H = imgData.naturalHeight * ratio;
	var box = {
		x: (data.x - data.width / 2) * W / 100,
		y: (data.y - data.height / 2) * H / 100,
		width: data.width * W / 100,
		height: data.height * H / 100,
		scaleX: ratio,
		scaleY: ratio
	};
	this.cropper.setData(box);
};

Crop.prototype.update = function() {
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
	this.input.closest('#form').removeEventListener('change', this.formChange, false);
	this.resetButton.removeEventListener('click', this.reset, false);
	this.zoomOutButton.removeEventListener('click', this.zoomOut, false);
	this.zoomInButton.removeEventListener('click', this.zoomIn, false);
	this.container.remove();
	delete this.container;
};

})(window.Pageboard);
