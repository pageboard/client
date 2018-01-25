(function(Pageboard) {

var modeControl;
var editStylePath = "/.pageboard/write/read.css";

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
};

Pageboard.hook = function(doc) {
	buildListener(Pageboard.read.contentWindow, doc);
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

function submitListener(e) {
	var form = e.target.form || e.target.closest('form');
	if (form && /^get$/i.test(form.method)) return;
	e.preventDefault();
	e.stopImmediatePropagation();
	if (Pageboard.editor.destroying) return;
	Pageboard.notify(`Forms cannot be submitted when editing pages`, {
		timeout: 1,
		where: 'write'
	});
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
	} else if (node.matches('input')) {
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
	var sheet = doc.head.querySelector(`[href="${editStylePath}"]`);
	if (sheet) sheet.disabled = false;
	modeControl.classList.remove('active');
}

function viewMode() {
	var doc = Pageboard.window.document;
	var sheet = doc.head.querySelector(`[href="${editStylePath}"]`);
	if (sheet) sheet.disabled = true;
	doc.body.classList.remove('ProseMirror');
	doc.body.removeAttribute('contenteditable');
	modeControl.classList.add('active');
}

function modeControlListener() {
	if (modeControl.matches('.active')) editMode();
	else viewMode();
}

function buildListener(win, doc) {
	Pageboard.window = win;
	win.addEventListener('click', anchorListener, true);
	win.addEventListener('mouseup', anchorListener, true);
	win.addEventListener('click', labelListener, true);
	win.addEventListener('submit', submitListener, true);
	win.addEventListener('keydown', function(e) {
		if (e.altKey) win.document.body.classList.add('ProseMirror-alt');
	});
	win.addEventListener('keyup', function(e) {
		win.document.body.classList.remove('ProseMirror-alt');
	});
	win.Pageboard.elements.page.stylesheets.push(editStylePath);
	editMode(doc);
	var resolver = function() {
		win.removeEventListener('pagebuild', resolver);
		setupListener(win);
	};
	if (win.Page.stage() >= 2) resolve();
	else win.addEventListener('pagebuild', resolver);
}

function setupListener(win) {
	Pageboard.view = win.Pageboard.view;
	Pageboard.bindings = win.Pageboard.bindings;
	editorSetup(win, win.Pageboard.view);
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

function editorUpdate(editor, state, focusParents, focusSelection) {
	if (!focusParents || !focusSelection || editor.destroying) {
		// editor is updated only from focus changes
		return;
	}
	var parents = [];

	focusParents.forEach(function(item) {
		var node = item.root.mark || item.root.node;
		var block = editor.blocks.get(node.attrs.id);
		if (!block) {
			block = editor.blocks.fromAttrs(node.attrs);
			delete node.attrs.id;
		}
		item.block = block;
		item.type = node.attrs.type || block.type;
		parents.push(item);
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

function editorSetup(win, view) {
	console.log("Use Pageboard.dev() to debug prosemirror");
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
		topNode: 'page',
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
		controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
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
		window.ProseMirrorDevTools.applyDevTools(editor, {
			EditorState: Pageboard.window.Pagecut.View.EditorState
		});
	} else {
		var script = window.document.createElement('script');
		script.onload = function() {
			script.remove();
			Pageboard.dev();
		};
		script.src = "/.pageboard/write/lib/prosemirror-dev-tools.min.js";
		window.document.head.appendChild(script);
	}
};

})(window.Pageboard);

