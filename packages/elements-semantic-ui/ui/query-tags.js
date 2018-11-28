class HTMLElementQueryTags extends HTMLCustomElement {
	init() {
		this.remove = this.remove.bind(this);
		this.patch = this.patch.bind(this);
	}
	connectedCallback() {
		Page.patch(this.patch);
		this.addEventListener('click', this.remove);
	}
	disconnectedCallback() {
		Page.unpatch(this.patch);
		this.removeEventListener('click', this.remove);
	}
	patch(state) {
		if (this.closest('[block-content="template"]')) return;
		var query = state.query;
		var labels = this.querySelector('.labels');
		if (!labels) return;
		labels.textContent = '';
		var field, label;
		for (var name in query) {
			HTMLElementQuery.find(name, query[name]).forEach(function(control) {
				if (control.type == "hidden") return;
				field = control.closest('.field');
				if (!field) return;
				label = field.querySelector('label');
				if (!label) return;
				if (control.value == null || control.value == "" || !label.innerText) return;
				var prev = labels.querySelector(`[data-name="${name}"][data-value="${control.value}"]`);
				if (prev) return;
				labels.insertAdjacentHTML('beforeEnd', `<a class="ui label" data-name="${name}" data-value="${control.value}">
					${label.innerText}
					<i class="delete icon"></i>
				</a>`);
			}, this);
		}
	}
	remove(e) {
		var label = e.target.closest('.label');
		if (!label) return;
		HTMLElementQuery.find(label.dataset.name, label.dataset.value).forEach(function(control) {
			if (control.type == "hidden") return;
			if (control.checked) control.checked = false;
			else if (control.reset) control.reset();
			else if (control.value) control.value = "";
			var e = document.createEvent('HTMLEvents');
			e.initEvent('submit', true, true);
			control.form.dispatchEvent(e);
		}, this);
		label.remove();
	}
}

Page.init(function() {
	HTMLCustomElement.define('element-query-tags', HTMLElementQueryTags);
});

