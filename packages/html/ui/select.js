class HTMLElementSelect extends Page.Element {
	#observer;

	static defaults = {
		placeholder: null,
		name: null,
		value: null,
		multiple: false,
		disabled: false,
		required: false
	};

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

	handleClick(e, state) {
		if (this.isContentEditable) return;
		const node = e.target;
		const item = node.closest('element-select .item');
		if (item) {
			const opt = this.#selectOption(item.dataset.value);
			if (opt) {
				opt.selected = true;
				opt.dispatchEvent(new Event('change', {
					bubbles: true,
					cancelable: true
				}));
				this.#toggleMenu(false);
			}
			return;
		}
		const label = node.closest('.label');
		if (label) {
			const opt = this.#selectOption(label.dataset.value);
			if (opt) {
				opt.selected = false;
				opt.dispatchEvent(new Event('change', {
					bubbles: true,
					cancelable: true
				}));
			}
			return;
		}
		this.#toggleMenu();
	}
	handleChange(e, state) {
		const opt = e.target;
		if (opt.selected) {
			this.#selectItem(opt.value);
		} else {
			this.#deselectItem(opt.value);
		}
	}
	#toggleMenu(show) {
		const style = this.#menu.style;
		if (show === undefined) show = !style.display;
		style.display = show ? "block" : null;
	}
	#selectItem(val) {
		const select = this.#select;
		const item = this.#menuOption(val);

		if (this.options.multiple) {
			if (this.#child(`.label[data-value="${val}"]`) == null) {
				this.#setText("").insertAdjacentHTML(
					'beforeBegin',
					`<a class="ui label" data-value="${val}">${item.innerHTML}<i class="delete icon"></i></a>`
				);
			}
		} else {
			this.#setText(item.innerText.trim());
		}

		const defaultOption = select.querySelector(`option[value=""]`);
		if (defaultOption && val) defaultOption.selected = false;
	}
	#deselectItem(val) {
		if (this.options.multiple) {
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
	#setPlaceholder(str) {
		const text = this.#text;
		if (!str) str = this.options.placeholder;

		const defaultOption = this.#select.querySelector('option[value=""]');
		if (defaultOption) {
			if (!str) str = defaultOption.innerHTML;
			else defaultOption.innerHTML = str;
		}
		text.textContent = str;
		text.classList.add('default');
	}

	#menuOption(val) {
		return this.querySelector(`element-select-option[data-value="${val}"]`);
	}
	#selectOption(val) {
		return this.querySelector(`select > option[value="${val}"]`);
	}

	close() {
		if (this.#observer) {
			this.#observer.disconnect();
			this.#observer = null;
		}
	}
	#fillSelect() {
		const select = this.#select;
		if (!select) return;
		const menu = this.#menu;
		menu.children.forEach(item => {
			const val = item.dataset.value;
			select.insertAdjacentHTML(
				'beforeEnd',
				`<option value="${val == null ? '' : val}">${item.innerHTML}</option>`
			);
		});
	}
	setup(state) {
		this.#observer = new MutationObserver(mutations => this.#fillSelect());
		this.#observer.observe(this.#menu, {
			childList: true
		});
	}

	build(state) {
		if (this.isContentEditable) return;
		if (this.children.length == 1) {
			this.insertAdjacentHTML(
				'afterBegin',
				'<i class="dropdown icon"></i><div class="text"></div><select></select>'
			);
		}
		const select = this.#select;

		select.disabled = this.options.disabled;
		select.required = this.options.required;
		select.multiple = this.options.multiple;
		if (!select.multiple) {
			for (const node of this.querySelectorAll('.ui.label')) node.remove();
		}
		select.name = this.options.name;
		if (!select.required) {
			const menu = this.#menu;
			if (!menu.querySelector('element-select-option[data-value=""]')) {
				menu.insertAdjacentHTML('afterBegin', `<element-select-option data-value="" block-type="input_select_option" class="item">-</element-select-option>`);
			}
		}
		this.#fillSelect();
	}

	patch(state) {
		if (this.isContentEditable) return; // write mode stop there
		if (this.children.length == 1) this.build(state);

		// FIXME this does work in query_form > fetch > select
		// instead one must do fetch > query_form > select

		state.finish(() => {
			// synchronize after form has filled select
			let val;
			this.#select.children.forEach(opt => {
				if (opt.value) {
					if (opt.selected) val = opt.value;
					else this.#deselectItem(opt.value);
				}
			});
			if (val != null) this.#selectItem(val);
		});
	}
}

Page.define('element-select', HTMLElementSelect);

