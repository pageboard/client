Pageboard.schemaHelpers['element-property'] = class ElementProperty {
	constructor(input, opts, props) {
		this.field = input.closest('.field');
		this.field.classList.add('inline');
		this.input = input;
	}

	static asPaths(obj, ret, pre) {
		if (!ret) ret = {};
		const props = obj.properties;
		if (!props) return ret;
		Object.keys(props).forEach(function (key) {
			const val = props[key];
			const cur = `${pre || ""}${key}`;
			ret[cur] = val;
			ElementProperty.asPaths(val, ret, cur + '.');
		});
		return ret;
	}

	init(block) {
		const dom = Pageboard.editor.blocks.domQuery(block.id);
		if (!dom) throw new Error("Cannot create input, DOM node not found for block " + block.id);
		const form = dom.closest('form');
		const formId = form.getAttribute('block-id');
		const formBlock = Pageboard.editor.blocks.get(formId);
		if (!formBlock) throw new Error("Cannot find form block for " + formId);
		this.formBlock = formBlock;
		let type = formBlock.data || {};
		if (formBlock.type == "query_form") {
			type = type.type;
		} else if (formBlock.type == "api_form") {
			type = ((type.action || {}).parameters || {}).type;
		} else {
			type = null;
		}
		if (!type) throw new Error("Please select a type to bind the form to");
		const el = Pageboard.editor.element(type);
		if (!el) throw new Error("Cannot map type to element " + type);
		this.el = el;

		this.input.hidden = true;
		const doc = this.input.ownerDocument;
		const paths = ElementProperty.asPaths(this.el, {}, this.el.name + '.');
		const content = Pageboard.editor.element(form.getAttribute('block-type')).contents.get(this.formBlock);
		function getSelectOption(key) {
			const prop = paths[key];
			if (!prop.title) return;
			let node;
			if (prop.type == "object") {
				node = doc.dom(`<optgroup label="${prop.title}"></optgroup>`);
			} else {
				node = doc.dom(`<option value="${key}">${prop.title}</option>`);
				const pkey = key.split('.').slice(1).join('.');
				node.disabled = Boolean(content.querySelector(`[name="${pkey}"]`));
			}
			return node.outerHTML;
		}
		this.select = doc.dom(`<select class="ui compact dropdown">
		<option value="">--</option>
		${Object.keys(paths).map(getSelectOption).join('\n')}
	</select>`);
		this.field.appendChild(this.select);
		this.select.addEventListener('change', this.toInput.bind(this));
		this.update(block);
	}

	toInput() {
		const cur = this.select.value;
		this.updateOptions(this.input.value, cur);
		this.input.value = cur;
		// not sure it's useful to trigger something here
		Pageboard.trigger(this.input, 'change');
	}

	updateOptions(prev, cur) {
		this.select.options.forEach(function (opt) {
			if (opt.value == prev) opt.disabled = false;
			if (opt.value == cur) opt.disabled = true;
		});
	}

	update(block) {
		const cur = block.data.name || "";
		this.updateOptions(this.select.value, cur);
		this.select.value = cur;
	}

	destroy() {
		if (this.select) this.select.remove();
		this.input.hidden = false;
	}

};
