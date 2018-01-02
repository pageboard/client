(function(Pageboard) {

var modeControl;

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	iframe.addEventListener('load', function(e) {
		iframe.contentWindow.addEventListener('pagebuild', function() {
			buildListener(iframe.contentWindow);
		});
		if (iframe.contentWindow.Page.stage() >= 2) {
			buildListener(iframe.contentWindow);
		}
	});
	iframe.addEventListener('dblclick', dblclickListener, false);
	init(state);
	Pageboard.write = document.getElementById('pageboard-write');
	Pageboard.scrollbar = new PerfectScrollbar(Pageboard.write);
	modeControl = document.querySelector('#store > [data-command="view"]');
	modeControl.removeEventListener('click', modeControlListener, false);
	modeControl.addEventListener('click', modeControlListener, false);
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

var lastClicked;
var lastClickedOnce;

function anchorListener(e) {
	var node = e.target.closest('a[href],button[type="submit"]');
	if (!node) return;
	e.preventDefault();
	var msg;
	if (node.matches('a')) {
		if (!node.ownerDocument.body.matches('.ProseMirror')) {
			Page.push(node.href);
			return;
		}
		msg = `<a href="${node.href}" target="${node.target}" rel="${node.rel}"><i class="icon hand pointer"></i>Follow link: ${node.href}</a>`;
	} else if (node.matches('button')) {
		msg = `Forms cannot be submitted when editing pages`;
	}
	Pageboard.notify(msg, {
		label: 'link',
		timeout: 3,
		where: 'read'
	});
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

function editMode() {
	var doc = Pageboard.window.document;
	doc.body.classList.add('ProseMirror');
	doc.body.setAttribute('contenteditable', 'true');
	doc.head.insertAdjacentHTML('beforeEnd', `
	<link rel="stylesheet" href="/.pageboard/write/read.css" />
	`);
	modeControl.classList.remove('active');
}

function viewMode() {
	var doc = Pageboard.window.document;
	var node = doc.head.querySelector('[href="/.pageboard/write/read.css"]');
	if (node) node.remove();
	doc.body.classList.remove('ProseMirror');
	doc.body.removeAttribute('contenteditable');
	modeControl.classList.add('active');
}

function modeControlListener() {
	if (modeControl.matches('.active')) editMode();
	else viewMode();
}

function buildListener(win) {
	Pageboard.window = win;
	Pageboard.view = win.Pageboard.view;

	var node = win.document.createElement('script');
	node.onload = function() {
		node.remove();
		setupListener(win);
	};
	node.src = '/.pageboard/pagecut/editor.js';
	win.document.head.appendChild(node);
	editMode();
}

function setupListener(win) {
	win.addEventListener('click', anchorListener);

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
	if (!focusParents || !focusSelection) {
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
	if (Pageboard.editor) {
		Pageboard.editor.destroy();
		Object.keys(Pageboard.editor.controls).forEach(function(name) {
			var control = Pageboard.editor.controls[name];
			if (control.destroy) control.destroy();
		});
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

