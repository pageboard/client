(function(Pageboard) {
Pageboard.inputs.element = Element;

function Element(input, opts, props) {
	this.field = input.closest('.field');
	this.input = input;
	this.elements = Object.values(Pageboard.editor.elements).filter(function(el) {
		return opts.standalone ? el.standalone : true;
	});
}

Element.prototype.init = function(block) {
	this.input.hidden = true;
	var doc = this.input.ownerDocument;
	function getSelectOption(el) {
		return `<option value="${el.name}">${el.title}</option>`;
	}
	this.select = doc.dom(`<select class="ui compact dropdown">
		<option value="">--</option>
		${this.elements.map(getSelectOption).join('\n')}
	</select>`);
	this.field.appendChild(this.select);
	this.select.addEventListener('change', this.toInput.bind(this));
	this.update(block);
};

Element.prototype.toInput = function() {
	this.input.value = this.select.value;
	// not sure it's useful to trigger something here
	Pageboard.trigger(this.input, 'change');
};

Element.prototype.update = function(block) {
	var list = this.input.name.split('.');
	var val = block.data;
	for (var i=0; i < list.length; i++) {
		val = val[list[i]];
		if (val == null) break;
	}
	this.select.value = val == null ? "" : val;
};

Element.prototype.destroy = function() {
	this.select.remove();
	this.input.hidden = false;
};

})(window.Pageboard);
