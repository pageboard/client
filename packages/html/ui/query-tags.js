class HTMLElementQueryTags extends VirtualHTMLElement {
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
	patch(state) {
		if (this.closest('[block-content="template"]')) return;
		var query = state.query;
		var labels = this.querySelector('.labels');
		if (!labels) return;
		var field, label;
		// must be called after query_form's patch
		state.finish(() => {
			labels.textContent = '';
			for (var name in query) {
				HTMLElementQueryTags.find(name, query[name]).forEach((control) => {
					if (control.type == "hidden") return;
					field = control.closest('.field');
					if (!field) return;
					label = field.querySelector('label');
					if (!label) return;
					var val = control.value;
					if (val == null || val == "" || !label.innerText) return;
					var prev = labels.querySelector(`[data-name="${name}"][data-value="${val}"]`);
					if (prev) return;
					var prefix = '';
					var group = field.closest('.grouped.fields');
					if (group && group.firstElementChild.matches('label')) {
						prefix = group.firstElementChild.textContent + ' ';
					}
					var suffix = '';					
					if (control.rangeValue) {
						val = control.rangeValue;
						if (val[0] == val[1]) {
							suffix = ' ＝ ' + val[0];
						} else {
							prefix = val[0] + ' ⩽ ';
							suffix = ' ⩽ ' + val[1];
						}
					} else if (control.type == "text") {
						suffix = ': "' + control.value + '"';
					}
					labels.insertAdjacentHTML('beforeEnd', `<a class="ui simple mini compact labeled icon button" data-name="${name}" data-value="${control.value}">
						<i class="delete icon"></i>
						${prefix}${label.innerText}${suffix}
					</a>`);
				});
			}
		});
	}
	handleClick(e) {
		this.remove(e.target.closest('[data-name]'));
	}
	remove(label) {
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

Page.ready(function() {
	VirtualHTMLElement.define('element-query-tags', HTMLElementQueryTags);
});

