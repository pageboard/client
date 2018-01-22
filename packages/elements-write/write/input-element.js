(function(Pageboard) {
Pageboard.inputs.element = Element;

function Element(input, opts, props, block) {
	this.field = input.closest('.field');
	this.input = input;
	this.elements = Pageboard.editor.elements.filter(function(el) {
		return (opts.properties ? el.properties : true) && el.menu && Pageboard.Controls.Menu.tabs.indexOf(el.menu) < 0;
	});
	this.init();
	this.update(block);
}

Element.prototype.init = function() {
	this.input.hidden = true;
	var doc = this.input.ownerDocument;
	function getSelectOption(el) {
		return doc.dom`<option value="${el.name}">${el.title}</option>`;
	}
	this.select = doc.dom`<select class="ui compact dropdown">
		<option value="">--</option>
		${this.elements.map(getSelectOption)}
	</select>`;
	this.field.appendChild(this.select);
	this.select.addEventListener('change', this.toInput.bind(this));
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
