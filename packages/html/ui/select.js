class HTMLElementSelect extends Page.Element {
	#observer;

	#child(sel) {
		return this.children.find(node => node.matches(sel));
	}
	get #menu() {
		return this.#child('.menu');
	}
	get #text() {
		return this.#child('.text');
	}
	get #select() {
		return this.#child('select');
	}

	get name() {
		return this.getAttribute('name');
	}

	get required() {
		return this.hasAttribute('required');
	}

	get multiple() {
		return this.hasAttribute('multiple');
	}

	get disabled() {
		return this.hasAttribute('disabled');
	}

	get value() {
		return this.getAttribute('value');
	}

	set name(n) {
		this.setAttribute('name', n);
	}

	set required(b) {
		if (b) this.setAttribute('required', '');
		else this.removeAttribute('required');
	}

	set multiple(b) {
		if (b) this.setAttribute('multiple', '');
		else this.removeAttribute('multiple');
	}

	set disabled(b) {
		if (b) this.setAttribute('disabled', '');
		else this.removeAttribute('disabled');
	}

	set value(v) {
		this.getAttribute('value', v);
	}

	handleClick(e, state) {
		if (state.scope.$write) return;
		if (this.disabled) return;
		const node = e.target;
		const item = node.closest('element-select .item');
		if (item) {
			const opt = this.#selectOption(item.dataset.value);
			if (opt) {
				opt.selected = true;
				state.dispatch(opt, 'change');
				this.classList.remove('active');
			}
			return;
		}
		const label = node.closest('.label');
		if (label) {
			const opt = this.#selectOption(label.dataset.value);
			if (opt) {
				opt.selected = false;
				state.dispatch(opt, 'change');
			}
			return;
		}
		this.classList.toggle('active');
	}
	handleChange(e, state) {
		const opt = e.target;
		if (opt.selected) {
			this.#selectItem(opt);
		} else {
			this.#deselectItem(opt);
		}
	}
	#selectItem(opt) {
		const select = this.#select;
		const val = opt.getAttribute('value');
		const item = this.#menuOption(val);

		if (this.multiple) {
			if (this.#child(`.label[data-value="${val}"]`) == null) {
				this.#setText("").insertAdjacentHTML(
					'beforeBegin',
					`<a class="ui label" data-value="${val}">${item.innerHTML}<i class="delete icon"></i></a>`
				);
			}
		} else {
			this.#setText(item.innerText.trim());
		}

		const defaultOption = select.querySelector(`option:not([value])`);
		if (defaultOption && val) defaultOption.selected = false;
	}
	#deselectItem(opt) {
		const val = opt.getAttribute('value');
		if (this.multiple && val) {
			const item = this.#child(`.label[data-value="${val}"]`);
			if (item) item.remove();
		}
		if (!this.#select.value) {
			this.#setPlaceholder();
		}
	}
	#setText(str) {
		const text = this.#text;
		text.textContent = str;
		text.classList.remove('default');
		return text;
	}
	#setPlaceholder(str = '') {
		const text = this.#text;

		const defaultOption = this.#select.querySelector('option[value=""]');
		if (defaultOption) {
			if (!str) str = defaultOption.innerHTML;
			else defaultOption.innerHTML = str;
		}
		text.textContent = str;
		text.classList.add('default');
	}

	#menuOption(val) {
		if (val == null) val = "";
		return this.querySelector(`element-select-option[data-value="${val}"]`);
	}
	#selectOption(val) {
		if (val == null) val = "";
		return this.querySelector(`select > option[value="${val}"]`);
	}

	close() {
		if (this.#observer) {
			this.#observer.disconnect();
			this.#observer = null;
		}
	}
	fill(values) {
		this.#select.children.forEach(opt => {
			if (opt.value) {
				if (opt.selected) this.#selectItem(opt);
				else this.#deselectItem(opt);
			}
		});
	}
	prepare(editable) {
		const select = this.#select;
		select.disabled = this.disabled;
		select.required = this.required;
		select.multiple = this.multiple;
		if (!select.multiple) {
			for (const node of this.querySelectorAll('.ui.label')) node.remove();
		}
		select.name = this.name;
		const menu = this.#menu;
		const defaultOption = menu.querySelector('element-select-option[data-value=""]');
		if (!select.required && !editable) {
			if (!defaultOption) {
				menu.insertAdjacentHTML('afterBegin', `<element-select-option data-value="" block-type="input_select_option" class="item">-</element-select-option>`);
			}
		} else if (defaultOption) {
			defaultOption.remove();
		}
		if (menu.children.length != select.children.length && !editable) {
			// TODO do a better check
			select.textContent = '';
			select.insertAdjacentHTML('afterBegin', '<option value="[item.dataset.value]">[children|at:*|repeat:item|.innerText]</option>');
			select.fuse(this.#menu, {});
		}
	}
	setup() {
		if (this.isContentEditable) return;
		this.#observer = new MutationObserver(mutations => this.prepare());
		this.#observer.observe(this.#menu, {
			childList: true
		});
	}
}

Page.define('element-select', HTMLElementSelect);
