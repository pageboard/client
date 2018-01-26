(function(Pageboard) {
Pageboard.Controls.Breadcrumb = Breadcrumb;

var template;

function Breadcrumb(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;

	template = this.template = template || this.$node[0].cloneNode(true);
	this.clear();
	this.$node.on('click', '.section', this.click.bind(this));
	this.selectMenu = $('#select-menu').on('click', this.selectMenuClick.bind(this))[0];
}

function contentOption(contents, name) {
	return document.dom`<div class="item" data-value="${name}">
		${contents[name].title}
	</div>`;
}

Breadcrumb.prototype.destroy = function() {
	this.$node.off('click');
	$(this.selectMenu).off('click');
};

Breadcrumb.prototype.selectMenuClick = function(e) {
	var item = e.target.closest('[data-command]');
	if (!item || item.matches('.disabled')) return;
	var command = item.dataset.command;
	var tr = this.editor.state.tr;
	if (command == "left") {
		if (!this.editor.utils.move(tr, -1)) return;
	} else if (command == "right") {
		if (!this.editor.utils.move(tr, 1)) return;
	} else if (command == "delete") {
		if (!this.editor.utils.deleteTr(tr)) return;
	}
	tr.setMeta('editor', true);
	this.editor.dispatch(tr);
	this.editor.focus();
};

Breadcrumb.prototype.update = function(parents) {
	this.clear();
	var parent;
	for (var i = parents.length - 1; i >= 0; i--) {
		parent = parents[i];
		this.$node.append(this.item(parent));
	}
	var contentName = parent.contentName;
	var contents = this.editor.element(parent.type).contents;
	if (contentName) {
		this.$node.append(contents[contentName].title);
	} else {
		this.$node.find('.section').last().addClass('active').next('.divider').remove();
	}
	this.selectMenu.querySelector('[data-command="left"]')
		.classList.toggle('disabled', !this.editor.utils.move(this.editor.state.tr, -1));
	this.selectMenu.querySelector('[data-command="right"]')
		.classList.toggle('disabled', !this.editor.utils.move(this.editor.state.tr, 1));
	this.selectMenu.querySelector('[data-command="delete"]')
		.classList.toggle('disabled', !this.editor.utils.deleteTr(this.editor.state.tr));
};

Breadcrumb.prototype.clear = function() {
	this.$node.empty();
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
	var items = this.$node.find('.section');
	var target = e && e.target || items.filter('.active').get(0);
	items.each(function(i, item) {
		var position;
		if (i == items.length - 1) position = "last";
		else if (i == 0) position = "first";
		else position = "middle";
		var sel = i > 0 ? `[block-focused="${position}"]` : '';
		var id = item.getAttribute('block-id');
		if (id) sel += `[block-id="${id}"]`;
		selectors.push(sel);
		if (item == target) return false;
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

