(function(Pageboard) {

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.appendChild(iframe);
	Pageboard.write = document.getElementById('pageboard-write');
	Ps.initialize(Pageboard.write);

	// setup "read" iframe in develop mode
	var loc = Page.parse(); // get a copy of state
	loc.query.develop = null;
	delete loc.query.write;

	iframe.addEventListener('load', function(e) {
		iframe.contentWindow.addEventListener('pagebuild', function() {
			buildListener(iframe.contentWindow);
		});
		if (iframe.contentWindow.Page.stage() >= 2) {
			buildListener(iframe.contentWindow);
		}
	});
	iframe.src = Page.format(loc);
};

var lastClicked;
var lastClickedOnce;
function anchorListener(e) {
	var clicked = e.target.closest('a,button[type="submit"]');
	if (clicked) {
		if (clicked == lastClicked) {
			if (!lastClickedOnce) {
				lastClickedOnce = true;
				e.preventDefault();
				Pageboard.notify(
					"Click again to " + (clicked.matches('a') ? 'open link' : 'submit form'),
					{timeout: 2}
				);
			} else {
				lastClicked = null;
				if (Pageboard.window.Page.sameDomain(Pageboard.window.Page.state, clicked.href)) {
					e.preventDefault();
					Pageboard.window.Page.push(Pageboard.window.Page.parse(clicked.href));
				} else {
					clicked.target = "_blank";
				}
			}
		} else {
			e.preventDefault();
			lastClickedOnce = false;
		}
	}
	lastClicked = clicked;
}

function unloadListener(e) {
	console.log("unload listener called");
	if (Pageboard.editor.controls.store.unsaved) {
		Pageboard.notify("Modifications saved locally.<br>Navigate back to save or discard.", {timeout: 2});
	}
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

	win.document.head.insertAdjacentHTML('beforeEnd', `
	<link rel="stylesheet" href="/.pageboard/write/read.css" />
	`);
}

function setupListener(win) {
	win.addEventListener('click', anchorListener);
	win.addEventListener('beforeunload', unloadListener);

	Page.patch(function() {
		var ed = Pageboard.editor;
		var unsaved = ed && ed.controls.store.unsaved;
		document.title = win.document.title + (unsaved ? '*' : '');
	});

	var state = win.Page.parse();
	delete state.query.develop;
	state.query.write = null;

	Page.replace(state).then(function() {
		Pageboard.editor = editorSetup(win, win.Pageboard.view);
	});
}

function pageUpdate(page) {
	var editor = this;
	editor.root.title = page.data.title;
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
		var block = editor.blocks.get(node.attrs.block_id);
		if (!block) {
			block = editor.utils.attrToBlock(node.attrs);
			delete node.attrs.block_id;
		}
		item.block = block;
		item.type = node.attrs.block_type || block.type;
		parents.push(item);
	});

	if (editor.controls) Object.keys(editor.controls).forEach(function(key) {
		var c = editor.controls[key];
		if (c.update) c.update(parents, focusSelection);
	});
	Page.replace(Page.state);
}

function editorSetup(win, view) {
	var Editor = win.Pagecut.Editor;

	var keyMap = {doc: 'page'};

	Editor.defaults.marks.forEach(function(key) {
		var nkey = keyMap[key] || key;
		var val = view.elementsMap[nkey];
		if (val) Editor.defaults.marks.update(key, val, nkey);
	});
	Editor.defaults.nodes.forEach(function(key) {
		var nkey = keyMap[key] || key;
		var val = view.elementsMap[nkey];
		if (val) Editor.defaults.nodes.update(key, val, nkey);
	});

	var content = win.document.body.cloneNode(true);

	// and the editor must be running from child
	var editor = new Editor({
		topNode: 'page',
		elements: view.elementsMap,
		place: win.document.body,
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

	editor.blocks = view.blocks;
	editor.blocks.view = editor;
	editor.blocks.genId = function() {
		console.error("Transient genId called before store.genId is setup");
	};
	editor.utils.setDom(content);

	editor.controls = {};
	for (var key in Pageboard.Controls) {
		var lKey = key.toLowerCase();
		editor.controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
	}
	editor.focus();
	editor.dispatch(editor.state.tr.setSelection(editor.utils.select(0, true)).setMeta('editor', true));

	return editor;
}


})(window.Pageboard);

