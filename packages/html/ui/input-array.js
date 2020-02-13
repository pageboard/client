class HTMLElementInputArray extends HTMLCustomElement {
	captureBlur(e, state) {
		var parent = e.target.closest('[block-type]');
		if (!parent || !parent.matches('[block-type^="input_"]')) return;
		
		if (this.children.length > 1 && e.target.value == "" && parent != this.lastElementChild) {
			parent.remove();
		} else if (e.target.value != "" && parent == this.lastElementChild) {
			parent.insertAdjacentHTML('afterEnd', this.template.innerHTML);
		}
	}
	handleKeypress(e, state) {
		if (e.keyCode == 13) {
			e.preventDefault();
			this.captureBlur(e, state);
			var hasInput = this.lastElementChild.querySelector('input');
			if (hasInput) hasInput.focus();
		}
	}
	setup(state) {
		this.querySelectorAll('[name]').forEach(function(node) {
			node.setAttribute('autocomplete', 'nope');
		});
		var copy = document.createElement('div');
		for (var i=0; i < this.children.length; i++) copy.appendChild(this.children[i].cloneNode(true));
		var node;
		while ((node = copy.querySelector('[block-id]'))) node.removeAttribute('block-id');
		while ((node = copy.querySelector('[required]'))) node.removeAttribute('required');
		this.template = copy;
	}
}

Page.setup(function(state) {
	if (!state.scope.$write) HTMLCustomElement.define('element-input-array', HTMLElementInputArray);
});
