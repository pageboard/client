(function(Pageboard) {

var modeControl;

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	iframe.addEventListener('dblclick', dblclickListener, false);
	init(state);
	Pageboard.write = document.getElementById('pageboard-write');
	Pageboard.scrollbar = new PerfectScrollbar(Pageboard.write);
	modeControl = document.querySelector('#store > [data-command="view"]');
	modeControl.removeEventListener('click', modeControlListener, false);
	modeControl.addEventListener('click', modeControlListener, false);
	document.body.addEventListener('submit', function(e) {
		e.preventDefault();
	});
};

Pageboard.install = function(doc, page) {
	buildListener(Pageboard.read.contentWindow, doc, page);
};

Pageboard.patch = init;

function init(state) {
	// setup "read" iframe in develop mode
	var loc = Page.parse(Page.format(state)); // get a copy of state
	loc.query.develop = null;
	var src = Page.format(loc);

	var iframe = Pageboard.read;
	if (!iframe) return;
	if (iframe.getAttribute('src') == src) return;

	iframe.setAttribute('src', src);
}

Page.patch(function() {
	if (!Pageboard.window) return;
	var ed = Pageboard.editor;
	var unsaved = ed && ed.controls.store.unsaved;
	document.title = (Pageboard.window.document.title || "") + (unsaved ? '*' : '');
});

function submitListenerCapture(e) {
	e.preventDefault();
	e.stopImmediatePropagation();
	if (Pageboard.editor.destroying) return;
	Pageboard.notify(`Cannot edit and submit forms`, {
		timeout: 1,
		where: 'write'
	});
}

function invalidListenerCapture(e) {
	e.preventDefault();
	e.stopImmediatePropagation();
}

function labelListener(e) {
	var node = e.target.closest('label[for]');
	if (!node) return;
	e.preventDefault();
}

function anchorListener(e) {
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

var lastWidth, lastMinWidth;
function dblclickListener(e) {
	var iframe = e.target;
	if (!iframe.matches('iframe')) return;
	if (lastWidth) {
		iframe.style.width = lastWidth;
		lastWidth = null;
		editMode();
		iframe.style.minWidth = lastMinWidth;
	} else {
		var style = window.getComputedStyle(iframe);
		lastWidth = style.width;
		lastMinWidth = style.minWidth;
		iframe.style.width = '100vw';
		iframe.style.minWidth = "100vw";
		viewMode();
	}
}

function editMode(doc) {
	if (!doc) doc = Pageboard.window.document;
	doc.body.classList.add('ProseMirror');
	doc.body.setAttribute('contenteditable', 'true');
	var sheet = doc.head.querySelector(`[href="${document.body.dataset.js}"]`);
	if (sheet) sheet.disabled = false;
	modeControl.classList.remove('active');
}

function viewMode() {
	var doc = Pageboard.window.document;
	var sheet = doc.head.querySelector(`[href="${document.body.dataset.css}"]`);
	if (sheet) sheet.disabled = true;
	doc.body.classList.remove('ProseMirror');
	doc.body.removeAttribute('contenteditable');
	modeControl.classList.add('active');
}

function modeControlListener() {
	if (modeControl.matches('.active')) editMode();
	else viewMode();
}

function buildListener(win, doc, page) {
	Pageboard.window = win;
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

	var pageEl = win.Pageboard.elements[page.type];
	if (!pageEl.stylesheets) pageEl.stylesheets = [];
	if (!pageEl.scripts) pageEl.scripts = [];

	pageEl.stylesheets.push(document.body.dataset.css);
	pageEl.scripts.unshift(document.body.dataset.js);

	editMode(doc);
	var resolver = function() {
		win.removeEventListener('pagebuild', resolver);
		setupListener(win, page);
	};
	if (win.Page.stage() >= 2) resolve();
	else win.addEventListener('pagebuild', resolver);
}

function setupListener(win, page) {
	Pageboard.view = win.Pageboard.view;
	Pageboard.bindings = win.Pageboard.bindings;
	Pageboard.hrefs = win.Pageboard.hrefs;

	editorSetup(win, win.Pageboard.view, page);
}

function pageUpdate(page) {
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
var lastIgnore;

function editorUpdate(editor, state, focusParents, focusSelection) {
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
	console.info("Use Pageboard.dev() to debug prosemirror");
	Pageboard.write.classList.remove('loading');
	Pageboard.notify.destroy();
	if (Pageboard.editor) {
		Pageboard.editor.destroy();
		Object.keys(Pageboard.editor.controls).forEach(function(name) {
			var control = Pageboard.editor.controls[name];
			if (control.destroy) control.destroy();
		});
		delete Pageboard.editor;
	}
	var content = win.document.body.cloneNode(true);

	// and the editor must be running from child
	var editor = new win.Pagecut.Editor({
		topNode: page.type,
		elements: view.elementsMap,
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
				}
			}
		}]
	});

	editor.pageUpdate = pageUpdate;
	editor.blocks.initial = view.blocks.initial;
	editor.block = view.block;

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

