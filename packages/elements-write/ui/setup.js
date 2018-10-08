/* global PerfectScrollbar */
(function(Pageboard) {

var modeControl, writeMode = true, adv = false;

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	init(state);
	Pageboard.write = document.getElementById('pageboard-write');
	Pageboard.scrollbar = new PerfectScrollbar(Pageboard.write);
	modeControl = document.querySelector('#store > [data-command="view"]');
	modeControl.removeEventListener('click', modeControlListener, false);
	modeControl.addEventListener('click', modeControlListener, false);
	document.body.addEventListener('submit', function(e) {
		if (writeMode) e.preventDefault();
	});
};

Pageboard.patch = init;

function init(state) {
	// setup "read" iframe in develop write mode
	var loc = Page.parse(Page.format(state)); // get a copy of state
	loc.query.develop = "write";
	var src = Page.format(loc);

	var iframe = Pageboard.read;
	if (!iframe) return;
	if (iframe.getAttribute('src') == src) return;
	iframe.setAttribute('src', src);
	// this should kick early enough
	(function checkReady() {
		var win = iframe.contentWindow;
		if (win.Pageboard) win.Pageboard.elements.develop = {
			install: install
		};
		else setTimeout(checkReady);
	})();
}

Page.patch(function(state) {
	var win = Pageboard.window;
	if (!win) return;
	var store = Pageboard.editor.controls.store;
	document.title = (win.document.title || "") + (store.unsaved ? '*' : '');
	if (win.Page.state && win.Page.state.$data) {
		win.Page.state.$data.item = store.unsaved || store.initial;
	}
});

function submitListenerCapture(e) {
	if (!writeMode) return;
	e.preventDefault();
	e.stopImmediatePropagation();
	if (Pageboard.editor.destroying) return;
	Pageboard.notify(`Cannot edit and submit forms`, {
		timeout: 1,
		where: 'write'
	});
}

function invalidListenerCapture(e) {
	if (!writeMode) return;
	e.preventDefault();
	e.stopImmediatePropagation();
}

function labelListener(e) {
	if (!writeMode) return;
	var node = e.target.closest('label[for]');
	if (!node) return;
	e.preventDefault();
}

function anchorListener(e) {
	if (!writeMode) return;
	var node = e.target.closest('a[href],input[type="file"]');
	if (!node) return;
	if (node.href) {
		e.preventDefault();
		if (Pageboard.editor.destroying) return;
		if (!node.ownerDocument.body.matches('.ProseMirror')) {
			Pageboard.editor.destroying = true;
			Page.push(node.href);
		} else {
			Pageboard.notify("Use view mode to follow links", {
				timeout: 3,
				where: 'write'
			});
		}
	} else if (node.matches('input')) { // TODO never reached ?
		if (node.ownerDocument.body.matches('.ProseMirror')) {
			e.preventDefault();
			Pageboard.notify("Use view mode to fill forms", {
				timeout: 3,
				where: 'write'
			});
		}
	}
}

function modeControlListener() {
	if (writeMode) editorClose();
	writeMode = !writeMode;
	modeControl.classList.toggle('active');
	document.body.classList.toggle('read');
	Pageboard.window.Page.reload();
}

function install(doc, page, scope) {
	var win = Pageboard.window = Pageboard.read.contentWindow;
	win.addEventListener('click', anchorListener, true);
	// FIXME this prevents setting selection inside a selected link...
	//win.addEventListener('mouseup', anchorListener, true);
	win.addEventListener('click', labelListener, true);
	win.addEventListener('submit', submitListenerCapture, true);
	win.addEventListener('invalid', invalidListenerCapture, true);
	win.addEventListener('keydown', function(e) {
		if (e.altKey) win.document.body.classList.add('ProseMirror-alt');
	});
	win.addEventListener('keyup', function(e) {
		win.document.body.classList.remove('ProseMirror-alt');
	});

	var $el = scope.$elements[page.type];
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
		}
		return ret;
	};

	win.addEventListener('pagebuild', function(e) {
		setupListener(win, e.state.$data.item);
	});
}

function setupListener(win, page) {
	if (!writeMode) return;
	Pageboard.view = win.Pageboard.view;
	Pageboard.bindings = win.Pageboard.bindings;
	Pageboard.hrefs = win.Pageboard.hrefs;

	editorSetup(win, win.Pageboard.view, page);
}

function pageUpdate(page) {
	if (!writeMode) return;
	var editor = this;
	editor.root.title = page.data.title || "";
	Page.replace({
		pathname: page.data.url,
		query: Page.state.query
	}).then(function() {
		editorUpdate(editor, editor.state, lastFocusParents, lastFocusSelection);
	});
}

var lastFocusParents;
var lastFocusSelection;

function editorUpdate(editor, state, focusParents, focusSelection) {
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
	Page.replace(Page.state);
}

function editorSetup(win, view, page) {
	if (!adv) {
		adv = true;
		console.info("Use Pageboard.dev() to debug prosemirror");
	}
	Pageboard.write.classList.remove('loading');
	var content = win.document.body.cloneNode(true);

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
						editorUpdate(editor, state, lastFocusParents, lastFocusSelection);
					}
				};
			}
		}]
	});

	editor.pageUpdate = pageUpdate;
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
	editor.controls.store.realUpdate();
	editor.controls.store.quirkStart(!contentSize && win.document.body.children.length > 0);
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

