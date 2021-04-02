class HTMLElementSelect extends VirtualHTMLElement {
	_observer

	static get defaults() {
		return {
			placeholder: null,
			name: null,
			value: null,
			multiple: false,
			disabled: false,
			required: false
		};
	}
	_child(sel) {
		return this.children.find(node => node.matches(sel));
	}
	get _menu() {
		return this._child('.menu');
	}
	get _text() {
		return this._child('.text');
	}
	get _select() {
		return this._child('select');
	}

	handleClick(e, state) {
		const node = e.target;
		const item = node.closest('element-select .item');
		if (item) {
			const opt = this._selectOption(item.dataset.value);
			if (opt) {
				opt.selected = true;
				opt.dispatchEvent(new Event('change', {
					bubbles: true,
					cancelable: true
				}));
				this._toggleMenu(false);
			}
		} else if (node.matches('.delete')) {
			const label = node.closest('.label');
			const opt = this._selectOption(label.dataset.value);
			if (opt) {
				opt.selected = false;
				opt.dispatchEvent(new Event('change', {
					bubbles: true,
					cancelable: true
				}));
			}
		} else {
			this._toggleMenu();
		}
	}
	handleChange(e, state) {
		const opt = e.target;
		if (opt.selected) {
			this._selectItem(opt.value);
		} else {
			this._deselectItem(opt.value);
		}
	}
	_toggleMenu(show) {
		const style = this._menu.style;
		if (show === undefined) show = !style.display;
		style.display = show ? "block" : null;
	}
	_selectItem(val) {
		const select = this._select;
		const item = this._menuOption(val);

		if (this.options.multiple) {
			if (this._child(`.label[data-value="${val}"]`) == null) {
				this._setText("").insertAdjacentHTML(
					'beforeBegin',
					`<a class="ui label" data-value="${val}">${item.innerHTML}<i class="delete icon"></i></a>`
				);
			}
		} else {
			this._setText(item.innerText.trim());
		}

		const defaultOption = select.querySelector(`option[value=""]`);
		if (defaultOption && val) defaultOption.selected = false;

		if (val != this.value) {
			this.dataset.value = val;
		}
	}
	_deselectItem(val) {
		if (this.options.multiple) {
			this._menuOption(val).remove();
		}
		if (!this._select.value) {
			this._setPlaceholder();
		}
	}
	_setText(str) {
		const text = this._text;
		text.textContent = str;
		text.classList.remove('default');
		return text;
	}
	_setPlaceholder(str) {
		const text = this._text;
		text.textContent = str || this.options.placeholder;
		text.classList.add('default');

		const defaultOption = this._select.querySelector('option[value=""]');
		if (defaultOption) defaultOption.innerHTML = str || "-";
	}

	_menuOption(val) {
		return this.querySelector(`element-select-option[data-value="${val}"]`);
	}
	_selectOption(val) {
		return this.querySelector(`select > option[value="${val}"]`);
	}
	reset() {
		this._select.reset();
		this.querySelectorAll('.ui.label').forEach(node => node.remove());
		this._setPlaceholder();
	}
	close() {
		if (this._observer) {
			this._observer.disconnect();
			this._observer = null;
		}
	}
	_buildSelect() {
		const select = this._select;
		if (!select) return;
		const menu = this._menu;
		select.innerHTML = '<option selected value="">-</option>';
		menu.children.forEach(item => select.insertAdjacentHTML(
			'beforeEnd',
			`<option value="${item.dataset.value || item.innerText.trim()}">${item.innerHTML}</option>`
		));
	}
	setup(state) {
		this._observer = new MutationObserver((mutations) => this._buildSelect());
		this._observer.observe(this._menu, {
			childList: true
		});
	}
	patch(state) {
		let init = false;
		if (this.children.length == 1) {
			init = true;
			this.insertAdjacentHTML(
				'afterBegin',
				'<i class="dropdown icon"></i><div class="text"></div><select></select>'
			);
		}
		const select = this._select;

		select.disabled = this.options.disabled;
		select.required = this.options.required;
		const multiple = select.multiple;
		select.multiple = this.options.multiple;
		if (multiple != select.multiple) this.reset();
		select.name = this.options.name;

		if (!select.value) {
			this._setPlaceholder();
		}
		if (this.isContentEditable) return; // write mode stop there
		if (init) this._buildSelect();
		state.finish(() => {
			// synchronize after form has filled select
			select.children.forEach((opt) => {
				if (opt.value) {
					if (opt.selected) this._selectItem(opt.value);
					else this._deselectItem(opt.value);
				}
			});
		});
	}
}

VirtualHTMLElement.define('element-select', HTMLElementSelect);

