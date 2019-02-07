(function(Pageboard) {

var adv = false;

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

	// this should kick early enough
	(function checkReady() {
		var win = iframe.contentWindow;
		if (win.Pageboard) {
			win.Pageboard.elements.develop = {
				install: install
			};
		} else {
			setTimeout(checkReady, 100);
		}
	})();
});

Pageboard.adopt = function(win, readState) {
	Page.setup(function(writeState) {
		win.addEventListener('click', anchorListener, true);
		// FIXME this prevents setting selection inside a selected link...
		//win.addEventListener('mouseup', anchorListener, true);
		win.addEventListener('submit', submitListener, true);
		win.addEventListener('invalid', submitListener, true);
		win.addEventListener('keydown', function(e) {
			if (e.altKey) win.document.body.classList.add('ProseMirror-alt');
		});
		win.addEventListener('keyup', function(e) {
			win.document.body.classList.remove('ProseMirror-alt');
		});
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

			Pageboard.hrefs = readState.scope.$hrefs;

			var editor = Pageboard.editor;
			if (!editor || !editor.closed) {
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

function install(scope) {
	var $el = scope.$element;
	var $orig = {
		fuse: $el.fuse,
		scripts: $el.scripts.slice(),
		stylesheets: $el.stylesheets.slice()
	};
	$el.fuse = function(node, d, scope) {
		var editor = Pageboard.editor;
		if (!editor || !editor.closed) {
			this.stylesheets = document.body.dataset.css.split(',').concat($orig.stylesheets);
			this.scripts = document.body.dataset.js.split(',').concat($orig.scripts);
		}
		var ret = $orig.fuse ? $orig.fuse.call(this, node, d, scope) : node.fuse(d, scope);
		if (!editor || !editor.closed) {
			var body = node.querySelector('body');
			body.classList.add('ProseMirror');
			body.setAttribute('contenteditable', 'true');
			body.setAttribute('spellcheck', 'false');
			scope.$write = false;
		} else {
			scope.$write = true;
		}
		return ret;
	};
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
	return list.map(function(item) {
		var node = item.root.node;
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
		return obj;
	});
}

function update() {
	var editor = this;
	var tr = editor.state.tr;
	var sel = tr.selection;
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
	Pageboard.write.classList.remove('loading');
	if (!page || page.type == "error") {
		Pageboard.write.hidden = true;
		console.warn("Not loading editor: no page or error page");
		return;
	}

	var content = win.document.body.cloneNode(true);
	var view = state.scope.$view;
	var editor = Pageboard.editor;
	if (editor && !editor.closed) {
		editor.close();
	}
	// and the editor must be running from child
	editor = Pageboard.editor = new win.Pagecut.Editor({
		topNode: page.type,
		elements: view.elements,
		place: win.document.body,
		genId: Pageboard.Controls.Store.genId,
		scope: state.scope,
		plugins: [{
			filterTransaction: function(tr) {
				if (tr.docChanged) editor.docChanged = true;
				return true;
			},
			view: function() {
				return {
					update: function(editor) {
						editor.update();
					}
				};
			}
		}]
	});

	editor.updatePage = updatePage.bind(editor, state);
	editor.update = Pageboard.debounce(update.bind(editor), 50);
	editor.close = editorClose.bind(editor);
	editor.devTools = devTools.bind(editor);

	Pageboard.dev = function() {
		editor.devTools();
	};

	editor.blocks.initial = view.blocks.initial;

	// keep runtime store in sync with editor store
	Object.keys(view.blocks.store).forEach(function(id) {
		if (!editor.blocks.store[id]) {
			editor.blocks.store[id] = view.blocks.store[id];
		}
	});
	view.blocks.store = editor.blocks.store;

	var controls = {};
	Object.keys(Pageboard.Controls).forEach(function(key) {
		var lKey = key.toLowerCase();
		controls[lKey] = new Pageboard.Controls[key](editor, document.getElementById(lKey));
	});
	editor.controls = controls;
	var $store = state.data.$store;
	if ($store) {
		controls.store.reset($store);
	}

	editor.focus();
	var contentSize = content.children.length;

	try {
		editor.utils.setDom(content);
	} catch(err) {
		Pageboard.notify("Pageboard cannot read saved page", err);
		editor.controls.store.reset();
		contentSize = 0;
		editor.utils.setDom(win.document.createTextNode(""));
	}
	controls.store.realUpdate();
	controls.store.quirkStart(!contentSize && win.document.body.children.length > 0);
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

