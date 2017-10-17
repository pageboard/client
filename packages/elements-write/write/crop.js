(function(Pageboard) {
Pageboard.inputs.crop = Crop;

function Crop(input, opts, props, block) {
	this.input = input;
	this.x = input.querySelector('[name="crop.x"]');
	this.y = input.querySelector('[name="crop.y"]');
	this.width = input.querySelector('[name="crop.width"]');
	this.height = input.querySelector('[name="crop.height"]');
	this.zoom = input.querySelector('[name="crop.zoom"]');
	input.classList.add('crop');
	this.button = input.dom`<div class="mini ui basic icon button">
		<i class="compress icon"></i>
	</div>`;
	input.appendChild(this.button);
	this.reset = this.reset.bind(this);
	this.button.addEventListener('click', this.reset, false);
	this.container = input.dom`<div class="crop"><div></div></div>`;
	input.appendChild(this.container);
	this.debouncedChange = Pageboard.Debounce(this.change.bind(this), 500);

	this.block = block;
	this.formChange = this.formChange.bind(this);

	this.init();
}

Crop.prototype.init = function() {
	this.croppie = new Croppie(this.container.children[0], {
		enableResize: true,
		mouseWheelZoom: false,
		update: this.debouncedChange
	});
	this.load();
	this.input.closest('#form').addEventListener('change', this.formChange, false);
};

Crop.prototype.formChange = function(e) {
	if (!e.target.matches('[name="url"]')) return;
	this.destroy();
	setTimeout(function() {
		this.init();
	}.bind(this));
};

Crop.prototype.reset = function() {
	var crop = this.block.data.crop;
	crop.width = 100;
	crop.height = 100;
	crop.x = 50;
	crop.y = 50;
	crop.zoom = 1.0;
	this.update();
};

Crop.prototype.change = function(vals) {
	if (!vals || vals.zoom == undefined) return;
	var p = vals.points;
	var W = this.imageWidth;
	var H = this.imageHeight;
	if (!W || !H) return;
	var x0 = parseFloat(p[0]);
	var x1 = parseFloat(p[2]);
	var y0 = parseFloat(p[1]);
	var y1 = parseFloat(p[3]);
	var w = 100 * (x1 - x0) / W;
	var h = 100 * (y1 - y0) / H;
	if (w > 100) w = 100;
	if (h > 100) h = 100;
	this.width.value = Math.round(w);
	this.height.value = Math.round(h);
	var x = Math.round(100 * (x0 + x1) / (2 * W));
	this.x.value = Math.max(0, x);
	var y = Math.round(100 * (y0 + y1) / (2 * H));
	this.y.value = Math.max(0, y);
	console.log("change", x, y, w, h);
	this.zoom.value = vals.zoom;
	Pageboard.trigger(this.input, 'change');
};

Crop.prototype.load = function() {
	this.croppie.bind({
		url: this.block.data.url || '/.files/@pageboard/elements/ui/placeholder.png'
	}).then(function() {
		this.imageWidth = this.croppie._originalImageWidth;
		this.imageHeight = this.croppie._originalImageHeight;
		this.update();
	}.bind(this));
};

Crop.prototype.update = function() {
	var W = this.imageWidth;
	var H = this.imageHeight;
	if (!W || !H) return;
	var data = this.block.data.crop;
	var dw = data.width * W / 100;
	var dh = data.height * H / 100;
	var x0 = data.x * W / 100 - dw / 2;
	var y0 = data.y * H / 100 - dh / 2;

	var rect = this.croppie.elements.boundary.getBoundingClientRect();
	var vpw = Math.round(data.width * rect.width / 100) + 'px';
	var vph = Math.round(data.height * rect.height / 100) + 'px';
	this.croppie.elements.viewport.style.width = vpw;
	this.croppie.elements.viewport.style.height = vph;
	var resizer = this.croppie.elements.boundary.querySelector('.cr-resizer');
	if (resizer) {
		resizer.style.width = vpw;
		resizer.style.height = vph;
	}
	this.croppie.bind({
		url: this.block.data.url || '/.files/@pageboard/elements/ui/placeholder.png',
		points: [x0, y0, x0 + dw, y0 + dh],
		zoom: data.zoom
	});
};

Crop.prototype.destroy = function() {
	this.croppie.destroy();
	delete this.croppie;
	this.input.closest('#form').removeEventListener('change', this.formChange, false);
};

})(window.Pageboard);
