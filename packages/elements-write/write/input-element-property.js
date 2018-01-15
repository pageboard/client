(function(Pageboard) {
Pageboard.inputs['element-property'] = ElementProperty;

function ElementProperty(input, opts, props, block) {
	this.field = input.closest('.field');
	this.input = input;
	var dom = Pageboard.editor.blocks.domQuery(block.id);
	if (!dom) throw new Error("Cannot create input, DOM node not found for block " + block.id);
	var form = dom.closest('form');
	var formId = form.getAttribute('block-id');
	var formBlock = Pageboard.editor.blocks.get(formId);
	if (!formBlock) throw new Error("Cannot find form block for " + formId);
	this.formBlock = formBlock;
	var type = formBlock.data.action.type;
	var el = Pageboard.editor.element(type);
	if (!el) throw new Error("Cannot map type to element " + type);
	this.el = el;
	this.init();
	this.update(block);
}

function asPaths(obj, ret, pre) {
	if (!ret) ret = {};
	var props = obj.properties;
	if (!props) return ret;
	Object.keys(props).forEach(function(key) {
		var val = props[key];
		var cur = `${pre || ""}${key}`;
		ret[cur] = val;
		asPaths(val, ret, cur + '.');
	});
	return ret;
}

ElementProperty.prototype.init = function() {
	this.input.hidden = true;
	var doc = this.input.ownerDocument;
	var paths = asPaths(this.el, {}, this.el.name + '.');
	var content = this.formBlock.content.form;
	function getSelectOption(key) {
		var prop = paths[key];
		if (!prop.title) return;
		if (prop.type == "object") {
			node = doc.dom`<optgroup label="${prop.title}"></optgroup>`;
		} else {
			node = doc.dom`<option value="${key}">${prop.title}</option>`;
			var pkey = key.split('.').slice(1).join('.');
			node.disabled = !!content.querySelector(`[name="${pkey}"]`);
		}
		return node;
	}
	this.select = doc.dom`<select class="ui compact dropdown">
		<option value="">--</option>
		${Object.keys(paths).map(getSelectOption)}
	</select>`;
	this.field.appendChild(this.select);
	this.select.addEventListener('change', this.toInput.bind(this));
};

ElementProperty.prototype.toInput = function() {
	var cur = this.select.value;
	this.updateOptions(this.input.value, cur);
	this.input.value = cur;
	// not sure it's useful to trigger something here
	Pageboard.trigger(this.input, 'change');
};

ElementProperty.prototype.updateOptions = function(prev, cur) {
	Array.from(this.select.options).forEach(function(opt) {
		if (opt.value == prev) opt.disabled = false;
		if (opt.value == cur) opt.disabled = true;
	});
};

ElementProperty.prototype.update = function(block) {
	var cur = block.data.name || "";
	this.updateOptions(this.select.value, cur);
	this.select.value = cur;
};

ElementProperty.prototype.destroy = function() {
	this.select.remove();
	this.input.hidden = false;
};

})(window.Pageboard);
