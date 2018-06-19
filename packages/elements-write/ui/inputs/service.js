(function(Pageboard) {
Pageboard.inputs.service = Service;

function Service(input, opts, props, block) {
	this.field = input.closest('.field');
	this.input = input;
//	console.log("new service", input);
//	this.init();
//	this.update(block);
}

Service.prototype.init = function() {
//	console.log("init service");
return;
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

Service.prototype.toInput = function() {
//	console.log("toInput service");
	return;
	this.input.value = this.select.value;
	// not sure it's useful to trigger something here
	Pageboard.trigger(this.input, 'change');
};

Service.prototype.update = function(block) {
//	console.log("update service");
	return;
	var list = this.input.name.split('.');
	var val = block.data;
	for (var i=0; i < list.length; i++) {
		val = val[list[i]];
		if (val == null) break;
	}
	this.select.value = val == null ? "" : val;
};

Service.prototype.destroy = function() {
//	console.log("destroy service");
	return;
	this.select.remove();
	this.input.hidden = false;
};

})(window.Pageboard);
