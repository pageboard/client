class HTMLElementQueryTags extends HTMLCustomElement {
	static find(name, value) {
		var nodes = document.querySelectorAll(`form [name="${name}"]`);
		return Array.prototype.filter.call(nodes, function(node) {
			if (Array.isArray(value)) {
				if (value.indexOf(node.value) < 0) return;
			} else {
				if (value != node.value) return;
			}
			return true;
		});
	}
	init() {
		this.remove = this.remove.bind(this);
		this.patch = this.patch.bind(this);
	}
	connectedCallback() {
		this.addEventListener('click', this.remove);
		Page.patch(this.patch);
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.remove);
		Page.unpatch(this.patch);
	}
	patch(state) {
		if (this.closest('[block-content="template"]')) return;
		var query = state.query;
		var labels = this.querySelector('.labels');
		if (!labels) return;
		labels.textContent = '';
		var field, label;
		for (var name in query) {
			HTMLElementQueryTags.find(name, query[name]).forEach(function(control) {
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
		HTMLElementQueryTags.find(label.dataset.name, label.dataset.value).forEach(function(control) {
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

