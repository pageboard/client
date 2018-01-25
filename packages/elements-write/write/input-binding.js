(function(Pageboard) {
Pageboard.inputs.binding = Binding;

function Binding(input, opts, props, block) {
	this.field = input.closest('.field');
	this.input = input;
	this.init();
	this.update(block);
}

Binding.prototype.init = function() {
	this.input.hidden = true;
	var doc = this.input.ownerDocument;
	function getSelectOption(name) {
		return doc.dom`<option value="${name}">${Pageboard.bindings[name].title}</option>`;
	}
	this.select = doc.dom`<select class="ui compact dropdown">
		<option value="">--</option>
		${Object.keys(Pageboard.bindings).map(getSelectOption)}
	</select>`;
	this.field.appendChild(this.select);
	this.select.addEventListener('change', this.toInput.bind(this));
};

Binding.prototype.toInput = function() {
	this.input.value = this.select.value;
	// not sure it's useful to trigger something here
	Pageboard.trigger(this.input, 'change');
};

Binding.prototype.update = function(block) {
	var list = this.input.name.split('.');
	var val = block.data;
	for (var i=0; i < list.length; i++) {
		val = val[list[i]];
		if (val == null) break;
	}
	this.select.value = val == null ? "" : val;
};

Binding.prototype.destroy = function() {
	this.select.remove();
	this.input.hidden = false;
};

})(window.Pageboard);
