class HTMLElementQueryTags extends Page.Element {
	find(name, value) {
		let nodes;
		const formName = this.getAttribute('for');
		let sel = 'form[block-type="query_form"]';
		if (formName) {
			sel += `[name="${formName}"]`;
		}
		const parentForm = this.closest(sel);
		sel = `${sel} [name="${name}"]:not(select),${sel} select[name="${name}"] > option`;
		if (parentForm) {
			nodes = parentForm.querySelectorAll(sel);
		} else {
			nodes = document.querySelectorAll(sel);
		}

		return nodes.filter(node => {
			if (Array.isArray(value)) {
				if (value.indexOf(node.value) < 0) return;
			} else if (value != node.value) {
				return;
			}
			return true;
		});
	}
	patch(state) {
		const query = state.query;
		state.finish(() => {
			this.labels.textContent = '';
			if (state.scope.$write) this.insertLabel('', '', 'Auto');
			else for (const [name, val] of Object.entries(query)) {
				this.add(name, val);
			}
		});
	}
	insertLabel(name, value, title) {
		this.labels.insertAdjacentHTML(
			'beforeEnd',
			`<a class="ui simple mini compact labeled icon button"
			data-name="${name}" data-value="${value}"
			><i class="delete icon"></i>
				${title}
			</a>`);
	}
	add(name, value) {
		const labels = this.labels;
		this.find(name, value).forEach(control => {
			if (control.type == "hidden") return;
			const field = control.closest('.field');
			if (!field) return;
			const label = field.querySelector('label');
			if (!label) return;
			let val = control.value;
			if (val == null || val == "" || !label.innerText) return;
			const prev = labels.querySelector(`[data-name="${name}"][data-value="${val}"]`);
			if (prev) return;
			let txt = label.innerText;
			let prefix = '';
			const group = field.closest('.grouped.fields');
			if (group?.firstElementChild.matches('label')) {
				prefix = group.firstElementChild.textContent + ' ';
			}
			let suffix = '';
			if (control.rangeValue) {
				val = control.rangeValue;
				if (val.length == 1) {
					suffix = ' ＝ ' + val[0];
				} else {
					prefix = val[0] + ' ⩽ ';
					suffix = ' ⩽ ' + val[1];
				}
			} else if (control.type == "text") {
				suffix = ': ' + control.value;
			} else if (control.matches('option')) {
				txt = control.innerText;
			} else if (control.type == "checkbox" || control.type == "radio") {
				prefix = "";
			}
			this.insertLabel(name, control.value, `${prefix}${txt}${suffix}`);
		});
	}
	handleClick(e) {
		this.remove(e.target.closest('[data-name]'));
	}
	remove(label) {
		if (!label) return;
		for (const control of this.find(label.dataset.name, label.dataset.value)) {
			if (control.type == "hidden") continue;
			if (control.checked) control.checked = false;
			else if (control.selected) control.selected = false;
			else if (control.reset) control.reset();
			else if (control.value) control.value = "";
			control.form.dispatchEvent(new Event('submit', {
				bubbles: true,
				cancelable: true
			}));
		}
		label.remove();
	}
	get labels() {
		return this.querySelector('.labels');
	}
}


Page.define('element-query-tags', HTMLElementQueryTags);


