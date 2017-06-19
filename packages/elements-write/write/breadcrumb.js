(function(Pageboard) {
Pageboard.Controls.Breadcrumb = Breadcrumb;

function Breadcrumb(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
	this.template = this.$node[0].cloneNode(true);
	this.clear();
	this.$node.on('click', '.section', this.click.bind(this));
}

function isAllSelected(editor) {
	var AllSelection = editor.root.defaultView.Pagecut.State.AllSelection;
	var sel = editor.state.selection;
	return (sel instanceof AllSelection);
}

function contentOption(contents, name) {
	return dom`<div class="item" data-value="${name}">${contents[name].title}</div>`;
}

Breadcrumb.prototype.update = function(parents) {
	this.clear();
	var parent;
	for (var i = parents.length - 1; i >= 0; i--) {
		parent = parents[i];
		this.$node.append(this.item(parent.block));
	}
	var contents = this.editor.map[parent.block.type].contents;
	if (contents) {
		var contentName = parent.content && parent.content.name;
		var contentSpec = contentName && contents[contentName] || {};
		var contentKeys = Object.keys(contents);
		if (contentName && contentKeys.length == 1) {
			contentSpec = contents[contentKeys[0]];
			this.$node.append(dom`<div class="ui inline dropdown">
				<div class="text">${contentSpec.title}</div>
			</div>`);
		} else if (contentKeys.length) {
			var select = dom`<div class="ui inline dropdown">
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
					var node = editor.modules.id.domQuery(parent.block.id, {
						content: val,
						focused: true
					});
					if (!node) {
						console.error("dom node not found", parent.block.id, val);
					} else {
						setTimeout(function() {
							editor.modules.id.domSelect(node.firstChild || node);
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

Breadcrumb.prototype.item = function(block) {
	var node = this.template.cloneNode(true);
	var item = node.querySelector('.section');
	item.textContent = this.editor.map[block.type].title;
	item.setAttribute('block-id', block.id);
	return node.innerHTML;
}

Breadcrumb.prototype.click = function(e) {
	var editor = this.editor;
	var id = e.target.getAttribute('block-id');
	var node = editor.modules.id.domQuery(id, {focused: true});
	if (!node) {
		throw new Error(`No node found with block-id ${id}`);
	}
	var sel = editor.select(node);
	if (sel) {
		editor.dispatch(editor.state.tr.setSelection(sel));
		editor.focus();
	}
};

})(window.Pageboard);

