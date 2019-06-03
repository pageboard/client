(function(Pageboard) {
Pageboard.Controls.Breadcrumb = Breadcrumb;

var template;

function Breadcrumb(editor, node) {
	this.node = node;
	this.editor = editor;

	template = this.template = template || this.node.firstElementChild.cloneNode(true);
	this.node.textContent = "";
	this.node.addEventListener('click', this);
}

Breadcrumb.prototype.destroy = function() {
	this.node.removeEventListener('click', this);
};

Breadcrumb.prototype.update = function(parents, selection) {
	var elders = this.parents || [];
	this.parents = parents = parents.slice().reverse();
	var parent, elder, item, cut = false;
	var children = this.node.children;
	for (var i = 0, j = 0; i < parents.length; i++,j++) {
		parent = parents[i];
		elder = elders[j];
		if (!elder || parent.block.id !== elder.block.id || parent.block.id == null || parent.contentName !== elder.contentName) {
			cut = true;
			item = this.item(parent);
			this.node.insertBefore(item, children[i]);
			if (children[i+1]) children[i+1].remove();
		} else {
			item = children[i];
		}
		if (item && item.children.length > 0) {
			item.firstElementChild.classList.toggle('active', parent.node.attrs.focused == "last");
		}
	}

	if (!cut) for (j=i; j < elders.length; j++) {
		item = children[j];
		if (!item || item.children.length == 0) break;
		parents.push(elders[j]);
		if (!item.hasAttribute('block-id')) {
			cut = true;
			break;
		}	else {
			item.firstElementChild.classList.remove('active');
		}
	}
	if (cut) while (children[j]) children[j].remove();

	var last = this.node.lastElementChild;
	var lastIsText = last && last.children.length == 0;
	if (!selection.node) {
		if (!lastIsText) {
			this.node.insertAdjacentHTML("beforeEnd", `<span>${parent.contentName || 'text'}</span>`);
		}
	} else if (lastIsText) {
		last.remove();
	}
};

Breadcrumb.prototype.item = function(parent) {
	var node = this.template.cloneNode(true);
	var item = node.querySelector('.section');
	item.textContent = this.editor.element(parent.type).title;
	node.setAttribute('block-type', parent.type);
	if (parent.block.id) node.setAttribute('block-id', parent.block.id);
	var contentName = parent.contentName;
	if (contentName) {
		var el = this.editor.element(parent.type);
		var contents = el.contents;
		if (Object.keys(contents).length > 1) {
			var title = contents[contentName].title;
			if (title) {
				node.insertBefore(node.ownerDocument.createTextNode(title), node.lastElementChild);
			}
		}
	}
	return node;
};

Breadcrumb.prototype.handleEvent = function(e) {
	if (e.type != "click") return;
	var editor = this.editor;
	var selectors = [];
	var items = Array.from(this.node.children);
	var target = e.target.closest('span');
	items.some(function(item, i) {
		var id = item.getAttribute('block-id');
		var type = item.getAttribute('block-type');
		selectors.push(id ? `[block-id="${id}"]` : `[block-type="${type}"][block-focused]`);
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

