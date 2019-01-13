class HTMLElementSelect extends HTMLCustomElement {
	static get observedAttributes() {
		return ['data-placeholder', 'data-name', 'data-multiple', 'value'];
	}
	handleClick(e, state) {
		var me = e.target.closest('element-select');
		if (me != this) {
			this._selectSelf(true);
			return;
		}
		var item = e.target.closest('element-select .item');
		if (item) {
			this._selectItem(item);
			this._selectSelf(true);
		} else if (e.target.matches('.delete')) {
			var label = e.target.closest('.label');
			var val = label.dataset.value;
			this._deselectItem(val);
		} else {
			this._selectSelf(false);
		}
	}
	_selectSelf(close) {
		// toggle menu
		var menu = this.querySelector('.menu');
		if (menu.style.display != "block" && !close) menu.style.display = 'block';
		else menu.style.display = 'none';
	}
	_selectItem(item) {
		var text = item.innerText.trim();
		var val = item.dataset.value;
		if (val == null) val = text;
		var html = item.innerHTML;
		var wasSelected = false;
		var option = this.querySelector(`select > option[value="${val}"]`);
		if (option) {
			if (option.selected) wasSelected = true;
			option.selected = true;
		}
		if (this.dataset.multiple) {
			if (!wasSelected) {
				this._setText("").insertAdjacentHTML('beforeBegin', `<a class="ui label" data-value="${val}">${html}<i class="delete icon"></i></a>`);
			}
		} else {
			this._setText(text);
		}

		var defaultOption = this.querySelector(`select > option[value=""]`);
		if (defaultOption) defaultOption.selected = false;
		if (!wasSelected && val != this.getAttribute('value')) this.querySelector('select').dispatchEvent(new Event('change', {
			cancelable: true,
			bubbles: true
		}));
	}
	_deselectItem(val) {
		if (this.dataset.multiple) {
			this.querySelector(`[data-value="${val}"]`).remove();
		}
		if (!this.dataset.multiple || this.querySelector('.label[data-value]') == null) {
			this._setPlaceholder();
		}
		var option = this.querySelector(`select > option[value="${val}"]`);
		if (option) option.selected = false;
	}
	_setText(str) {
		var text = this.querySelector('.text');
		text.textContent = str;
		text.classList.remove('default');
		return text;
	}
	_setPlaceholder(str) {
		var text = this.querySelector('.text');
		text.textContent = "";
		if (!str) str = this.dataset.placeholder;
		text.appendChild(document.createTextNode(str || ''));
		text.classList.add('default');

		var select = this.querySelector('select');
		select.querySelector('option[value=""]').innerHTML = str || "-";
	}
	handleChange(e, state) {
		if (!e.isTrusted) return;
		var items = Array.from(this.querySelector('.menu').children);
		Array.from(e.target.children).forEach(function(option, i) {
			var item = items.children[i];
			if (option.selected) this._selectItem(item);
		}, this);
	}
	_optionItem(item) {
		var node = item.ownerDocument.createElement('option');
		node.value = item.dataset.value || item.innerText.trim();
		node.innerHTML = item.innerHTML;
		return node;
	}
	setup(state) {
		if (!this.querySelector('.icon')) {
			this.insertAdjacentHTML('afterBegin', '<i class="dropdown icon"></i>');
		}
		var menu = this.querySelector('.menu');
		var select = this.querySelector('select');
		if (!select) {
			select = this.insertBefore(this.ownerDocument.createElement('select'), menu);
			select.name = this.dataset.name;
			this._update();
		}
		if (this.dataset.disabled) select.disabled = true;
		if (this.dataset.required) select.required = true;
		if (this.dataset.multiple) select.multiple = true;

		select.insertAdjacentHTML('beforeBegin', `<div class="text"></div>`);
		this._setPlaceholder();
		this._observer = new MutationObserver(function(mutations) {
			this._update();
		}.bind(this));
		this._observer.observe(menu, {
			childList: true
		});

		var initialValue = this.getAttribute('value');
		if (initialValue != null) this.attributeChangedCallback("value", null, initialValue);
	}
	_update() {
		var select = this.querySelector('select');
		var menu = this.querySelector('.menu');
		select.textContent = "";
		select.insertAdjacentHTML('afterBegin', '<option selected value="">-</option>');
		Array.prototype.forEach.call(menu.children, function(item) {
			select.appendChild(this._optionItem(item));
		}, this);
	}
	_reset() {
		var select = this.querySelector('select');
		select.value = "";
		Array.from(this.querySelectorAll('.ui.label')).forEach(function(node) {
			node.remove();
		});
		this._setPlaceholder();
	}
	close() {
		if (this._observer) {
			this._observer.disconnect();
			delete this._observer;
		}
	}
	attributeChangedCallback(attributeName, oldValue, newValue, namespace) {
		var select = this.querySelector('select');
		if (!select) return;
		if (attributeName == "data-placeholder" && !select.value) {
			this._setPlaceholder(newValue);
		}
		if (attributeName == "data-name") {
			select.name = newValue;
		} else if (attributeName == "data-multiple") {
			select.multiple = !!newValue;
			if (oldValue != newValue) {
				this._reset();
			}
		} else if (attributeName == "value") {
			this._selectItem(this.querySelector(`[data-value="${newValue}"]`));
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-select', HTMLElementSelect);
});
