(function(Pageboard) {

var adv = false;

Page.patch(function(state) {
	// write mode accepts all params at the moment
	Object.keys(state.query).forEach((key) => {
		state.vars[key] = true;
	});
});

Page.setup(function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	Pageboard.write = document.getElementById('pageboard-write');
	Pageboard.scrollbar = new window.PerfectScrollbar(Pageboard.write);
	document.body.addEventListener('submit', function(e) {
		e.preventDefault();
	});
	var loc = state.copy();
	loc.query.develop = "write";
	var src = Page.format(loc);

	if (iframe.getAttribute('src') == src) return;
	iframe.setAttribute('src', src);
});

Pageboard.adopt = function(win, readState) {
	Page.setup(function(writeState) {
		win.addEventListener('click', anchorListener, true);
		// FIXME this prevents setting selection inside a selected link...
		//win.addEventListener('mouseup', anchorListener, true);
		win.addEventListener('submit', submitListener, true);
		win.addEventListener('invalid', submitListener, true);
		readState.finish(function() {
			window.document.title = win.document.title;
			var readCopy = readState.copy();
			var dev = writeState.query.develop;
			if (dev !== undefined) readCopy.query.develop = dev;
			else delete readCopy.query.develop;
			writeState.pathname = readCopy.pathname;
			writeState.query = readCopy.query;
			// writeState.data = readState.data;
			writeState.save();

			Pageboard.hrefs = readState.scope.$hrefs || {};
			var editor = Pageboard.editor;
			if (editor && editor.closed) return;
			Pageboard.scrollbar.update();
			if (!Pageboard.modeControl) {
				Pageboard.modeControl = new Pageboard.Controls.Mode({
					root: { defaultView: win },
					close: function() {}
				}, document.getElementById("mode"));
			} else if (window.document.body.dataset.mode != "read") {
				Pageboard.Editor(win, readState);
			}
		});
	});
};

function submitListener(e) {
	if (!Pageboard.editor || Pageboard.editor.closed) return;
	e.preventDefault();
	e.stopImmediatePropagation();
}

function anchorListener(e) {
	var editor = Pageboard.editor;
	if (!editor || editor.closed) return;
	var node = e.target.closest('a[href],input,button,textarea,label[for]');
	if (!node) return;
	e.preventDefault();
	var isInput = node.matches('input,textarea,select');
	if (!isInput) return;
	var parent = node.closest('[block-type]');
	var sel = editor.utils.select(parent);
	if (sel) {
		editor.focus();
		editor.dispatch(editor.state.tr.setSelection(sel));
	}
}

function updatePage(state) {
	if (this.closed) return;
	var store = this.controls.store;
	if (!store) return;
	var page = store.unsaved || store.initial;
	if (!page || !page.data) return;
	var title = (page.data.title || "") + (store.unsaved ? '*' : '');
	var path = page.data.url;
	if (title != window.document.title || state.pathname != path) {
		state.pathname = page.data.url;
		window.document.title = title;
		state.save();
	}
}

function filterParents(editor, list) {
	var sec = [];
	list.forEach(function(item) {
		var node = item.root.node;
		if (node.attrs.focused == null) return;
		var obj = {
			node: node,
			block: editor.blocks.get(node.attrs.id) || editor.blocks.fromAttrs(node.attrs),
		};
		obj.type = node.attrs.type || obj.block.type;
		if (item.container) obj.contentName = item.container.name;
		if (item.inline) {
			obj.inline = {
				node: item.inline.node,
				blocks: item.inline.node.marks.map(function(mark) {
					return editor.blocks.get(mark.attrs.id) || editor.blocks.fromAttrs(mark.attrs);
				}),
				rpos: item.inline.rpos
			};
		}
		sec.push(obj);
	});
	return sec;
}

function update() {
	var editor = this;
	var tr = editor.state.tr;
	var sel = tr.selection;
	if (this.selection && sel.eq(this.selection)) return;
	this.selection = sel;
	var parents = filterParents(editor, editor.utils.selectionParents(tr, sel));
	var changed = editor.docChanged;
	editor.docChanged = false;
	if (!parents.length) return;
	if (editor.controls) Object.keys(editor.controls).forEach(function(key) {
		var c = editor.controls[key];
		try {
			if (c.update) c.update(parents, sel, changed);
		} catch(err) {
			Pageboard.notify(`control.${key}`, err);
		}
	});
	Pageboard.scrollbar.update();
	editor.updatePage();
}

Pageboard.Editor = function Editor(win, state) {
	var page = state.data.$cache.item;
	if (!adv) {
		adv = true;
		console.info("Use top.Pageboard.dev() to debug prosemirror");
	}
	if (!page || page.type == "error") {
		Pageboard.write.hidden = true;
		console.warn("Not loading editor: no page or error page");
		return;
	}

	var view = state.scope.$view;
	var editor = Pageboard.editor;
	if (editor && !editor.closed) {
		editor.close();
	}
	var doc = win.document;
	var body = doc.body;
	win.Pagecut.Editor.prototype.update = update;
	// and the editor must be running from child
	editor = Pageboard.editor = new win.Pagecut.Editor({
		store: view.blocks.store,
		topNode: page.type,
		elements: view.elements,
		explicit: document.body.dataset.mode == "code",
		place: doc.body,
		jsonContent: state.data.$jsonContent,
		content: body,
		genId: Pageboard.Controls.Store.genId,
		scope: state.scope,
		plugins: [{
			filterTransaction: function(tr) {
				if (tr && tr.docChanged && editor) editor.docChanged = true;
				return true;
			},
			view: function() {
				return {
					update: function(editor, prevState) {
						editor.update();
					}
				};
			}
		}]
	});

	editor.updatePage = updatePage.bind(editor, state);
	editor.close = editorClose.bind(editor);
	editor.devTools = devTools.bind(editor);

	Pageboard.dev = function() {
		editor.devTools();
	};

	// keep runtime store in sync with editor store
	view.blocks.store = editor.blocks.store;

	var controls = {};
	Object.keys(Pageboard.Controls).forEach(function(key) {
		var lKey = key.toLowerCase();
		var ControlClass = Pageboard.Controls[key];
		var node = document.getElementById(lKey);
		if (ControlClass.singleton) {
			controls[key] = ControlClass.singleton;
			ControlClass.singleton.reset(editor, node);
		} else {
			controls[lKey] = new ControlClass(editor, node);
		}
	});
	editor.controls = controls;
	var $store = state.data.$store;
	if ($store) {
		controls.store.reset($store);
	}
	controls.store.realUpdate();
	return editor;
};

function editorClose() {
	this.closed = true;
	Pageboard.notify.destroy();
	this.destroy();
	Object.keys(this.controls).forEach(function(name) {
		var control = this.controls[name];
		if (control.destroy) control.destroy();
	}, this);
}

function devTools() {
	var editor = this;
	if (window.ProseMirrorDevTools) {
		window.ProseMirrorDevTools.applyDevTools(editor, {
			EditorState: editor.root.defaultView.Pagecut.View.EditorState
		});
	} else {
		var script = document.createElement('script');
		script.onload = function() {
			script.remove();
			editor.devTools();
		};
		script.src = document.body.dataset.devtools;
		document.head.appendChild(script);
	}
}

})(window.Pageboard);

