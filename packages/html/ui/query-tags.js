class HTMLElementQueryTags extends VirtualHTMLElement {
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
			} else {
				if (value != node.value) return;
			}
			return true;
		});
	}
	patch(state) {
		const query = state.query;
		state.finish(() => {
			this.labels.textContent = '';
			if (this.isContentEditable) this.insertLabel('', '', 'Auto');
			else for (var name in query) {
				this.add(name, query[name]);
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
		this.find(name, value).forEach((control) => {
			if (control.type == "hidden") return;
			let field = control.closest('.field');
			if (!field) return;
			let label = field.querySelector('label');
			if (!label) return;
			var val = control.value;
			if (val == null || val == "" || !label.innerText) return;
			var prev = labels.querySelector(`[data-name="${name}"][data-value="${val}"]`);
			if (prev) return;
			var txt = label.innerText;
			var prefix = '';
			var group = field.closest('.grouped.fields');
			if (group && group.firstElementChild.matches('label')) {
				prefix = group.firstElementChild.textContent + ' ';
			}
			var suffix = '';
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
		this.find(label.dataset.name, label.dataset.value).forEach(function(control) {
			if (control.type == "hidden") return;
			if (control.checked) control.checked = false;
			else if (control.selected) control.selected = false;
			else if (control.reset) control.reset();
			else if (control.value) control.value = "";
			var e = document.createEvent('HTMLEvents');
			e.initEvent('submit', true, true);
			control.form.dispatchEvent(e);
		}, this);
		label.remove();
	}
	get labels() {
		return this.querySelector('.labels');
	}
}

Page.ready(function() {
	VirtualHTMLElement.define('element-query-tags', HTMLElementQueryTags);
});

