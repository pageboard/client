(function(Pageboard) {
Pageboard.inputs.crop = Crop;

function Crop(input, opts, props, block) {
	this.input = input;
	this.x = input.querySelector('[name="crop.x"]');
	this.y = input.querySelector('[name="crop.y"]');
	this.width = input.querySelector('[name="crop.width"]');
	this.height = input.querySelector('[name="crop.height"]');
	input.classList.add('crop');
	this.button = input.dom`<div class="mini ui basic icon button">
		<i class="compress icon"></i>
	</div>`;
	this.reset = this.reset.bind(this);
	this.button.addEventListener('click', this.reset, false);
	this.container = input.dom`<div class="crop"><div></div></div>`;
	input.appendChild(this.container);
	input.appendChild(this.button);
	this.debouncedChange = Pageboard.Debounce(this.change.bind(this), 500);

	this.block = block;
	this.formChange = this.formChange.bind(this);

	this.init();
}

Crop.prototype.init = function() {
	this.croppie = new Croppie(this.container.children[0], {
		enableResize: true,
		mouseWheelZoom: false,
		update: this.debouncedChange,
		relative: true
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
	this.update();
};

Crop.prototype.change = function(vals) {
	if (!vals) return;
	var p = vals.points;
	this.width.value = Math.round(p[2] - p[0]);
	this.height.value = Math.round(p[3] - p[1]);
	this.x.value = Math.round((p[0] + p[2]) / 2);
	this.y.value = Math.round((p[1] + p[3]) / 2);
	Pageboard.trigger(this.input, 'change');
};

Crop.prototype.load = function() {
	var url = this.block.data.url;
	if (url) url += '?rs=w:512';
	else url = '/.files/@pageboard/elements/ui/placeholder.png';
	this.croppie.bind({
		url: url
	}).then(function() {
		this.update();
	}.bind(this));
};

Crop.prototype.update = function() {
	if (this.croppie._originalImageWidth === undefined) {
		return;
	}
	var data = this.block.data.crop;

	var rect = this.croppie.elements.boundary.getBoundingClientRect();
	var vpw = Math.round(data.width * rect.width / 200) + 'px';
	var vph = Math.round(data.height * rect.height / 200) + 'px';
	this.croppie.elements.viewport.style.width = vpw;
	this.croppie.elements.viewport.style.height = vph;
	var resizer = this.croppie.elements.boundary.querySelector('.cr-resizer');
	if (resizer) {
		resizer.style.width = vpw;
		resizer.style.height = vph;
	}

	this.croppie.bind({
		url: this.croppie.data.url,
		points: [
			data.x - data.width / 2,
			data.y - data.height / 2,
			data.x + data.width / 2,
			data.y + data.height / 2
		]
	});
};

Crop.prototype.destroy = function() {
	this.croppie.destroy();
	delete this.croppie;
	this.input.closest('#form').removeEventListener('change', this.formChange, false);
};

})(window.Pageboard);
