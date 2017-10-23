(function(Pageboard) {

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	Pageboard.write = document.getElementById('pageboard-write');
	Pageboard.scrollbar = new PerfectScrollbar(Pageboard.write);

	// setup "read" iframe in develop mode
	var loc = Page.parse(); // get a copy of state
	loc.query.develop = null;
	delete loc.query.write;

	iframe.addEventListener('load', function(e) {
		iframe.contentWindow.addEventListener('pagesetup', function() {
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
	var node = e.target.closest('a[href],button[type="submit"]');
	if (!node) return;
	e.preventDefault();
	var msg;
	if (node.matches('a')) {
		// TODO remove this url modification when auth works
		var href = Page.parse(node.href);
		if (href.hostname == Page.state.hostname) {
			href.query.write = null;
		}

		msg = `<a href="${Page.format(href)}" target="${node.target}" rel="${node.rel}"><i class="icon hand pointer"></i>Follow link: ${node.href}</a>`;
	} else if (node.matches('button')) {
		// TODO submit form
	}
	Pageboard.notify(msg, {
		label: 'link',
		timeout: 3,
		where: 'read'
	});
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

	Page.patch(function() {
		var ed = Pageboard.editor;
		var unsaved = ed && ed.controls.store.unsaved;
		document.title = win.document.title + (unsaved ? '*' : '');
	});

	var state = win.Page.parse();
	delete state.query.develop;
	state.query.write = null;

	Page.replace(state).then(function() {
		editorSetup(win, win.Pageboard.view);
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
			block = editor.blocks.fromAttrs(node.attrs);
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
	Pageboard.scrollbar.update();
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

	Object.keys(view.blocks.store).forEach(function(id) {
		if (!editor.blocks.store[id]) {
			editor.blocks.store[id] = view.blocks.store[id];
		}
	});

	Pageboard.editor = editor; // some custom elements might rely on editor

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
	} catch(ex) {
		console.error(ex);
		Pageboard.notify("Catastrophic editor error<br>cannot read page<br>try to open front page and copy/paste to editor", {type: 'negative'});
	}
	editor.controls.store.realUpdate();
	editor.controls.store.quirkStart(!contentSize && win.document.body.children.length > 0);
	return editor;
}

})(window.Pageboard);

