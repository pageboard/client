(function(Pageboard, Pagecut) {

Pageboard.Controls.Menu = Menu;

function Menu(editor, selector) {
	this.editor = editor;
	this.node = document.querySelector(selector);
	this.blocks = this.node.dom`<div id="menu" class="ui mini labeled icon menu"></div>`;
	this.inlines = this.node.dom`<div id="menu" class="ui icon menu"></div>`;
	this.node.appendChild(this.blocks);
	this.node.appendChild(this.inlines);
	this.menu = new Pagecut.Menubar({
		items: this.items()
	});
}

Menu.prototype.update = function(parents, sel) {
	if (!sel || !parents) return;
	// because updates are done by the editor
	this.selection = sel;
	this.parents = parents;
	this.blocks.textContent = "";
	this.inlines.textContent = "";
	this.menu.items.forEach(function(item) {
		var dom = renderItem(item, this.editor);
		if (!dom) return;
		if (item.spec.element.inline) this.inlines.appendChild(dom);
		else this.blocks.appendChild(dom);
	}, this);

};

Menu.prototype.item = function(el) {
	var editor = this.editor;
	var schema = editor.state.schema;
	var nodeType = schema.nodes[el.name] || schema.marks[el.name];
	if (!nodeType || (!el.menu && !el.icon)) return;

	var self = this;

	var item = {
		element: el,
		run: function(state, dispatch, view) {
			var tr = state.tr;
			var sel = self.selection;
			var block = editor.blocks.create(el.name);
			if (!el.inplace) {
				block.id = editor.blocks.genId();
				editor.blocks.set(block);
			}
			if (el.inline) {
				editor.utils.toggleMark(nodeType, editor.blocks.toAttrs(block))(state, dispatch);
			} else {
				editor.blocks.from(block).then(function(fragment) {
					if (sel.node && !sel.empty) {
						sel = editor.utils.selectTr(tr, sel.from, true);
						tr.setSelection(sel);
					}
					var pos = editor.utils.insertTr(tr, fragment);
					if (pos != null) {
						sel = editor.utils.selectTr(tr, pos);
						if (sel) tr.setSelection(sel);
						dispatch(tr);
					}
				});
			}
		},
		select: function(state) {
			if (el.inline) {
				return !state.tr.selection.node && editor.utils.canMark(state.tr.selection, nodeType);
			} else {
				return editor.utils.canInsert(state.tr.selection.$from, nodeType);
			}
		},
		active: function(state) {
			if (!el.inline && self.parents.length) {
				var parent = self.parents[0];
				return parent.root && parent.root.node && parent.root.node.type.name == el.name;
			} else {
				return editor.utils.markActive(state.tr.selection, nodeType);
			}
		}
	};
	return item;
};


function renderItem(item, view) {
	var disabled = false;
	var spec = item.spec;
	if (spec.select && !spec.select(view.state)) {
		if (spec.onDeselected == "disable") {
			disabled = true;
		} else {
			return null;
		}
	}
	var active = spec.active && !disabled && spec.active(view.state);

	var dom = document.createElement('a');
	dom.className = "item";

	var icon = spec.element.icon;
	if (icon) {
		// can be a string formatted as SVG, or an URL
		if (/<svg/i.test(icon)) {
			dom.insertAdjacentHTML('afterbegin', icon);
			dom.querySelector('svg').setAttribute('class', 'icon');
		} else if (icon.startsWith('<')) {
			dom.insertAdjacentHTML('afterbegin', icon);
		} else {
			dom.insertAdjacentHTML('afterbegin', `<img class="icon" src="${icon}" />`);
		}
	}
	if (!spec.element.inline) {
		dom.appendChild(document.createTextNode('\n' + translate(view, spec.element.title)));
	}
	if (active) {
		dom.classList.add("active");
	}
	if (spec.element.description) {
		dom.setAttribute("title", translate(view, translate(spec.element.description)));
	}
	if (disabled) {
		dom.classList.add("disabled");
	} else {
		dom.addEventListener("mousedown", function (e) {
			e.preventDefault()
			spec.run(view.state, view.dispatch, view);
		});
	}
	return dom;
}

Menu.prototype.items = function() {
	var list = [];
	for (var i=0; i < this.editor.elements.length; i++) {
		var el = this.editor.elements[i];
		var itemSpec = this.item(el);
		if (!itemSpec) continue;
		item = new Pagecut.Menubar.Menu.MenuItem(itemSpec);
		list.push(item);
	}
	return list;
};

function translate(view, text) {
	return view._props.translate ? view._props.translate(text) : text;
}

})(window.Pageboard, window.Pagecut);

