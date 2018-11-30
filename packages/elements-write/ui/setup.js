(function(Pageboard) {

var modeControl, writeMode = true, adv = false;

Page.setup(function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	Pageboard.write = document.getElementById('pageboard-write');
	Pageboard.scrollbar = new window.PerfectScrollbar(Pageboard.write);
	modeControl = document.querySelector('#store > [data-command="view"]');
	modeControl.removeEventListener('click', modeControlListener, false);
	modeControl.addEventListener('click', modeControlListener, false);
	document.body.addEventListener('submit', function(e) {
		e.preventDefault();
	});
	var loc = Page.parse(Page.format(state)); // get a copy of state
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
			followPage(win, state);
		} else {
			setTimeout(checkReady, 10);
		}
	})();
});

function followPage(win, writeState) {
	var script = win.document.head.querySelector('script');
	script.addEventListener('pageinit', function(e) {
		win.Page.setup(function(readState) {
			readState.finish(function() {
				window.document.title = win.document.title;
				var readCopy = readState.copy();
				var writeCopy = writeState.copy();
				delete readCopy.query.develop;
				delete writeCopy.query.develop;
				// if (Page.samePath(readCopy, writeCopy)) return;
				var dev = writeState.query.develop;
				if (dev !== undefined) readCopy.query.develop = dev;
				else delete readCopy.query.develop;
				writeState.pathname = readCopy.pathname;
				writeState.query = readCopy.query;
				writeState.save();

				Pageboard.view = win.Pageboard.view;
				Pageboard.hrefs = readState.scope.$hrefs;

				if (writeMode) {
					editorSetup(win, win.Pageboard.view, readState);
				}
			});
		});
	});
}

function submitListener(e) {
	if (!writeMode) return;
	e.preventDefault();
	e.stopImmediatePropagation();
}

function anchorListener(e) {
	if (!writeMode) return;
	var node = e.target.closest('a[href],input,button,textarea,label[for]');
	if (!node) return;
	e.preventDefault();
}

function modeControlListener() {
	var win = Pageboard.window;
	win.Page.setup(function(state) {
		modeControl.classList.toggle('active');
		document.body.classList.toggle('read');
		if (writeMode) {
			var store = Pageboard.editor.controls.store;
			if (state && state.$data) {
				delete state.$data.items;
				store.flush();
				var backup = store.reset();
				state.$data.item = backup.unsaved || backup.initial;
				state.$store = backup;
			}
			editorClose();
			state.reload();
		} else {
			editorSetup(win, win.Pageboard.view, state);
		}
		writeMode = !writeMode;
	});
}

function install(scope) {
	var win = Pageboard.window = Pageboard.read.contentWindow;

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

	var $el = scope.$element;
	var $orig = {
		fuse: $el.fuse,
		scripts: $el.scripts.slice(),
		stylesheets: $el.stylesheets.slice()
	};
	$el.fuse = function(node, d, scope) {
		if (writeMode) {
			this.stylesheets = [document.body.dataset.css].concat($orig.stylesheets);
			this.scripts = [document.body.dataset.js].concat($orig.scripts);
		}
		var ret = $orig.fuse ? $orig.fuse.call(this, node, d, scope) : node.fuse(d, scope);
		if (writeMode) {
			var body = node.querySelector('body');
			body.classList.add('ProseMirror');
			body.setAttribute('contenteditable', 'true');
			body.setAttribute('spellcheck', 'false');
		}
		return ret;
	};
}

function updatePage(state) {
	if (!writeMode) return;
	var store = this.controls.store;
	if (!store) return;
	var page = store.unsaved || store.initial;
	if (!page || !page.data) return;
	window.document.title = (page.data.title || "") + (store.unsaved ? '*' : '');
	state.pathname = page.data.url;
	state.save();
}

function updateControls() {
	this.updateEditor(this.state, lastFocusParents, lastFocusSelection);
}

var lastFocusParents;
var lastFocusSelection;

function updateEditor(state, focusParents, focusSelection) {
	var editor = this;
	if (!writeMode) return;
	if (!focusParents || !focusSelection || editor.destroying) {
		// editor is updated only from focus changes
		return;
	}
	var parents = [];

	focusParents.forEach(function(item) {
		var node = item.root.node;
		var obj = {
			node: node,
			block: editor.blocks.get(node.attrs.id) || editor.blocks.fromAttrs(node.attrs),
		};
		obj.type = node.attrs.type || obj.block.type;
		if (item.container) obj.contentName = item.container.node.type.spec.contentName;
		if (item.inline) {
			obj.inline = {
				node: item.inline.node,
				blocks: item.inline.node.marks.map(function(mark) {
					return editor.blocks.get(mark.attrs.id) || editor.blocks.fromAttrs(mark.attrs);
				}),
				rpos: item.inline.rpos
			};
		}
		parents.push(obj);
	});

	if (editor.controls) Object.keys(editor.controls).forEach(function(key) {
		var c = editor.controls[key];
		try {
			if (c.update) c.update(parents, focusSelection);
		} catch(err) {
			Pageboard.notify(`control.${key}`, err);
		}
	});
	Pageboard.scrollbar.update();
	editor.updatePage();
}

function editorSetup(win, view, state) {
	var page = state.data.$cache.item;
	if (!adv) {
		adv = true;
		console.info("Use Pageboard.dev() to debug prosemirror");
	}
	Pageboard.write.classList.remove('loading');
	if (!page || page.type == "error") {
		Pageboard.write.hidden = true;
		return;
	}
	var content = win.document.body.cloneNode(true);
	if (Pageboard.editor) editorClose();

	// and the editor must be running from child
	var editor = new win.Pagecut.Editor({
		topNode: page.type,
		elements: view.elements,
		place: win.document.body,
		genId: Pageboard.Controls.Store.genId,
		plugins: [{
			filterTransaction: function(tr) {
				// filters all transactions
				var focusParents = tr.getMeta('focus-plugin');
				if (focusParents) {
					lastFocusParents = focusParents;
				}
				var focusSelection = tr.getMeta('focus-selection');
				if (focusSelection) {
					lastFocusSelection = focusSelection;
				}
				return true;
			},
			view: function() {
				return {
					update: function(editor, state) {
						// called after all current transactions have been applied
						editor.updateEditor(state, lastFocusParents, lastFocusSelection);
					}
				};
			}
		}]
	});

	editor.updatePage = updatePage.bind(editor, state);
	editor.updateControls = updateControls.bind(editor);
	editor.updateEditor = updateEditor.bind(editor);
	editor.blocks.initial = view.blocks.initial;

	Object.keys(view.blocks.store).forEach(function(id) {
		if (!editor.blocks.store[id]) {
			editor.blocks.store[id] = view.blocks.store[id];
		}
	});

	Pageboard.editor = editor; // some custom elements might rely on editor (?)

	var controls = {};
	Object.keys(Pageboard.Controls).forEach(function(key) {
		var lKey = key.toLowerCase();
		controls[lKey] = new Pageboard.Controls[key](editor, document.getElementById(lKey));
	});
	editor.controls = controls;
	if (state.$store) {
		controls.store.reset(state.$store);
		delete state.$store;
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
}

function editorClose() {
	Pageboard.notify.destroy();
	if (Pageboard.editor) {
		Pageboard.editor.destroy();
		Object.keys(Pageboard.editor.controls).forEach(function(name) {
			var control = Pageboard.editor.controls[name];
			if (control.destroy) control.destroy();
		});
		delete Pageboard.editor;
	}
}

Pageboard.dev = function() {
	if (window.ProseMirrorDevTools) {
		window.ProseMirrorDevTools.applyDevTools(Pageboard.editor, {
			EditorState: Pageboard.window.Pagecut.View.EditorState
		});
	} else {
		var script = window.document.createElement('script');
		script.onload = function() {
			script.remove();
			Pageboard.dev();
		};
		script.src = document.body.dataset.devtools;
		window.document.head.appendChild(script);
	}
};

})(window.Pageboard);

