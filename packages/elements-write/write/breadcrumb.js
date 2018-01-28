(function(Pageboard) {
Pageboard.Controls.Breadcrumb = Breadcrumb;

var template;

function Breadcrumb(editor, node) {
	this.node = node;
	this.editor = editor;

	template = this.template = template || this.node.cloneNode(true);
	this.clear();
	this.click = this.click.bind(this);
	this.node.addEventListener('click', this.click);
}

function contentOption(contents, name) {
	return document.dom`<div class="item" data-value="${name}">
		${contents[name].title}
	</div>`;
}

Breadcrumb.prototype.destroy = function() {
	this.node.removeEventListener('click', this.click);
};

Breadcrumb.prototype.update = function(parents) {
	this.clear();
	var parent;
	for (var i = parents.length - 1; i >= 0; i--) {
		parent = parents[i];
		this.node.insertAdjacentHTML('beforeEnd', this.item(parent));
	}
	var contentName = parent.contentName;
	var contents = this.editor.element(parent.type).contents;
	if (contentName) {
		this.node.appendChild(this.node.ownerDocument.createTextNode(contents[contentName].title));
	} else {
		if (this.node.lastElementChild) {
			this.node.lastElementChild.remove();
			this.node.lastElementChild.classList.add('active');
		}
	}
};

Breadcrumb.prototype.clear = function() {
	this.node.textContent = '';
};

Breadcrumb.prototype.item = function(parent) {
	var node = this.template.cloneNode(true);
	var item = node.querySelector('.section');
	item.textContent = this.editor.element(parent.type).title;
	if (parent.block.id) item.setAttribute('block-id', parent.block.id);
	return node.innerHTML;
}

Breadcrumb.prototype.click = function(e) {
	var editor = this.editor;
	var selectors = [];
	var items = Array.from(this.node.querySelectorAll('.section'));
	var target = e && e.target || this.node.querySelector('.section.active');
	items.some(function(item, i) {
		var position;
		if (i == items.length - 1) position = "last";
		else if (i == 0) position = "first";
		else position = "middle";
		var sel = i > 0 ? `[block-focused="${position}"]` : '';
		var id = item.getAttribute('block-id');
		if (id) sel += `[block-id="${id}"]`;
		selectors.push(sel);
		if (item == target) return true;
	});
	var selector = selectors.join(' ');
	var node = editor.root.querySelector(selector);
	if (!node) {
		throw new Error(`No node found with selector ${selector}`);
	}
	var sel = editor.utils.select(node);
	if (sel) {
		editor.focus();
		editor.dispatch(editor.state.tr.setSelection(sel));
	}
};

})(window.Pageboard);

