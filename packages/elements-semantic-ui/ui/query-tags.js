/* global HTMLElementQuery */
class HTMLElementQueryTags extends HTMLCustomElement {
	init() {
		this.close = this.close.bind(this);
	}
	connectedCallback() {
		this.addEventListener('click', this.close);
		if (this.children.length) this.refresh();
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.close);
	}
	refresh(query) {
		if (!query) {
			if (!Page.state) return;
			query = Page.state.query;
		}
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
				if (control.value == "") return;
				labels.insertAdjacentHTML('beforeEnd', `<a class="ui label" data-name="${name}" data-value="${control.value}">
					${label.innerText}
					<i class="delete icon"></i>
				</a>`);
			}, this);
		}
	}
	close(e) {
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

HTMLCustomElement.define('element-query-tags', HTMLElementQueryTags);

Page.patch(function(state) {
	Array.from(document.querySelectorAll('element-query-tags')).forEach(function(node) {
		node.refresh(state.query);
	});
});

