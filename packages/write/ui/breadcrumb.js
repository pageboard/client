(function(Pageboard) {
Pageboard.Controls.Breadcrumb = Breadcrumb;

function Breadcrumb(editor, node) {
	this.node = node;
	this.editor = editor;

	if (!Breadcrumb.template) {
		Breadcrumb.template = this.node.lastElementChild;
		Breadcrumb.template.remove();
	}
	this.node.addEventListener('click', this);
}

Breadcrumb.prototype.destroy = function() {
	this.node.removeEventListener('click', this);
};

Breadcrumb.prototype.update = function(parents, selection) {
	if (!this.parents) this.node.textContent = "";
	var elders = this.parents || [];
	this.parents = parents = parents.slice().reverse();
	var parent, elder, item, cut = false;
	var children = this.node.children;
	for (var i = 0, j = 0; i < parents.length; i++,j++) {
		parent = parents[i];
		elder = elders[j];
		if (!elder || parent.block.id !== elder.block.id || parent.block.id == null || parent.contentName && parent.contentName !== elder.contentName) {
			cut = true;
			item = this.item(parent);
			this.node.insertBefore(item, children[i]);
			if (children[i+1]) children[i+1].remove();
		} else {
			item = children[i];
		}
		if (item && item.children.length > 0) {
			item.dataset.focused = parent.node.attrs.focused;
			item.firstElementChild.classList.toggle('active', parent.node.attrs.focused == "last");
		}
	}

	if (!cut) for (j=i; j < elders.length; j++) {
		item = children[j];
		if (!item || item.children.length == 0) break;
		parents.push(elders[j]);
		if (!item.dataset.id) {
			cut = true;
			break;
		}	else {
			item.dataset.focused = elders[j].node.attrs.focused;
			item.firstElementChild.classList.remove('active');
		}
	}
	if (cut) while (children[j]) children[j].remove();

	var last = this.node.lastElementChild;
	if (!cut && last.children.length && last.dataset.content != parents[i-1].contentName) {
		delete last.dataset.content;
		while (last.firstElementChild && last.firstElementChild.nextSibling.nodeType == Node.TEXT_NODE) {
			last.firstElementChild.nextSibling.remove();
		}
	}
	var lastIsText = last && last.children.length == 0;
	if (!selection.node && parents.length > 1) {
		if (!lastIsText && !last.dataset.content) {
			this.node.insertAdjacentHTML("beforeEnd", `<span>${parent.contentName || 'text'}</span>`);
		}
	} else if (lastIsText) {
		last.remove();
	}
};

Breadcrumb.prototype.item = function(parent) {
	var node = Breadcrumb.template.cloneNode(true);
	var item = node.querySelector('.section');
	var el = this.editor.element(parent.type);
	item.textContent = el.title;
	node.dataset.selector = `[block-type="${parent.type}"]`;
	if (parent.block.id) node.dataset.id = parent.block.id;
	var contentName = parent.contentName;
	if (contentName) {
		var def = el.contents.find(contentName);
		var title = def.title;
		if (title) {
			node.dataset.content = contentName;
			node.insertBefore(node.ownerDocument.createTextNode(title), node.lastElementChild);
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
	var subFocused = false;
	items.some(function(item, i) {
		var id = item.dataset.id;
		var sel = item.dataset.selector;
		if (id) sel += `[block-id="${id}"]`;
		if (!subFocused) sel += '[block-focused]';
		if (item.dataset.focused == "last") subFocused = true;
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

