(function(Pageboard) {
Pageboard.inputs.pageTitle = PageTitle;

function PageTitle(input, opts, props) {
	this.input = input;
	this.inputUrl = input.closest('.form').querySelector('[name="url"]');
	this.change = this.change.bind(this);
	this.checkHandler = this.checkHandler.bind(this);
	$(this.input).on('input', this.change);
	$(this.inputUrl).on('input', this.checkHandler);
}

PageTitle.prototype.checkHandler = function(e) {
	this.check();
};

PageTitle.prototype.check = function(only) {
	var url = this.block.data.url || "";
	var nameUrl = url.split("/").pop();
	if (Pageboard.slug(this.input.value) == nameUrl) {
		this.tracking = true;
	} else if (!only) {
		this.tracking = false;
	}
};

PageTitle.prototype.change = function() {
	this.check(true);
	if (!this.tracking) return;
	var val = this.input.value;
	var slug = Pageboard.slug(val);
	var list = (this.block.data.url || '').split('/');
	list[list.length - 1] = slug;
	this.inputUrl.value = list.join('/');
	$(this.inputUrl).trigger('title-input');
};

PageTitle.prototype.init = PageTitle.prototype.update = function(block) {
	this.block = block;
	this.check();
};

PageTitle.prototype.destroy = function() {
	$(this.input).off('input', this.change);
	$(this.inputUrl).off('input', this.checkHandler);
};

Pageboard.inputs.pageUrl = PageUrl;

function PageUrl(input, opts, props) {
	this.field = input.closest('.field');
	this.input = input;
	this.check = this.check.bind(this);
	$(this.input).on('input title-input', this.check);
	this.sameDom = this.field.dom(`<div class="ui pointing red basic label">Another page has the same address</div>`);
}

PageUrl.prototype.check = function(e) {
	if (Pageboard.editor.controls.store.checkUrl(this.block.id, this.input.value)) {
		this.field.appendChild(this.sameDom);
		e.preventDefault();
		e.stopImmediatePropagation();
	} else {
		if (this.sameDom.parentNode) this.sameDom.remove();
	}
};

PageUrl.prototype.init = PageUrl.prototype.update = function(block) {
	this.block = block;
	this.check();
};

PageUrl.prototype.destroy = function() {
	$(this.input).off('input title-input', this.check);
};

})(window.Pageboard);
