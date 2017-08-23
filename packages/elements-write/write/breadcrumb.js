(function(Pageboard) {
Pageboard.Controls.Breadcrumb = Breadcrumb;

function Breadcrumb(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
	this.template = this.$node[0].cloneNode(true);
	this.clear();
	this.$node.on('click', '.section', this.click.bind(this));
}

function contentOption(contents, name) {
	return document.dom`<div class="item" data-value="${name}">${contents[name].title}</div>`;
}

Breadcrumb.prototype.update = function(parents) {
	this.clear();
	var parent;
	for (var i = parents.length - 1; i >= 0; i--) {
		parent = parents[i];
		this.$node.append(this.item(parent));
	}
	var contents = this.editor.element(parent.type).contents;
	if (contents && typeof contents != "string") {
		var contentName = parent.container && parent.container.name;
		var contentSpec = contentName && contents[contentName] || {};
		var contentKeys = Object.keys(contents);
		if (contentName && contentKeys.length == 1) {
			contentSpec = contents[contentKeys[0]];
			if (typeof contentSpec != "string" && contentSpec.title) {
				this.$node.append(document.dom`<div class="ui inline dropdown">
					<div class="text">${contentSpec.title}</div>
				</div>`);
			}
		} else if (contentKeys.length > 1) {
			var select = document.dom`<div class="ui inline dropdown">
				<div class="text">${contentSpec.title || ''}</div>
				<i class="dropdown icon"></i>
				<div class="menu">
					${contentKeys.map(contentOption.bind(null, contents))}
				</div>
			</div>`;
			this.$node.append(select);
			var editor = this.editor;
			$(select).dropdown({
				onChange: function(val, text) {
					var node = editor.blocks.domQuery(parent.block.id, {
						content: val,
						focused: true
					});
					if (!node) {
						console.error("dom node not found", parent.block.id, val);
					} else {
						setTimeout(function() {
							editor.blocks.domSelect(node.firstChild || node);
						});
					}
				}
			});
		}
	}
	this.$node.find('.section').last().addClass('active').next('.divider').remove();
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
	var position;
	if ($(e.target).nextAll('.section').length == 0) position = "last";
	else if ($(e.target).prevAll('.section').length == 0) position = "first";
	else position = "middle";
	var id = e.target.getAttribute('block-id') || null;
	var node = editor.blocks.domQuery(id, {focused: position});
	if (!node) {
		throw new Error(`No node found with block-id ${id} and focus ${position}`);
	}
	var sel = editor.utils.select(node);
	if (sel) {
		editor.focus();
		editor.dispatch(editor.state.tr.setSelection(sel));
	}
};

})(window.Pageboard);

