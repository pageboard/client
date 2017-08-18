(function(Pageboard) {

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	parentRead.appendChild(iframe);
	Pageboard.write = document.getElementById('pageboard-write');

	// setup "read" iframe in develop mode
	var loc = Page.parse(); // get a copy of state
	loc.query.develop = null;
	delete loc.query.write;

	// iframe.contentWindow will be cleared somewhere after setting iframe.src,
	// so one cannot setup a listener event just after
	iframe.onload = function() {
		// NOTE that if read.html does not load window-page.js, this won't work at all
		iframe.contentWindow.addEventListener('pageroute', routeListener);
		iframe.contentWindow.addEventListener('pagebuild', buildListener);
		iframe.contentWindow.addEventListener('pagesetup', setupListener);
	};
	iframe.src = Page.format(loc);
};

function routeListener(e) {
	Pageboard.window = this;
	this.removeEventListener('pageroute', routeListener);

	e.state.document.head.insertAdjacentHTML('beforeEnd', `
	<script src="/.pageboard/pagecut/editor.js"></script>
	`);
}

function buildListener(e) {
	Pageboard.view = this.Pageboard.view;
	this.removeEventListener('pagebuild', buildListener);
	this.document.head.insertAdjacentHTML('beforeEnd', `
	<link rel="stylesheet" href="/.pageboard/write/read.css" />
	`);
}

function setupListener(e) {
	var win = this;
	var state = e.state;
	var editor = Pageboard.editor = editorSetup(win, Pageboard.view);

	Pageboard.write.removeAttribute('hidden');

	// Perfect Scrollbar
	Ps.initialize(Pageboard.write);

	Page.patch(function() {
		var unsaved = editor.controls.store && editor.controls.store.unsaved;
		document.title = win.document.title + (unsaved ? '*' : '');
	});

	Page.replace(Page.state);
}

function pageUpdate(page) {
	var editor = this;
	editor.root.title = page.data.title;
	Page.replace({
		pathname: page.data.url,
		query: Page.state.query
	}).then(function() {
		editorUpdate(editor);
	});
}

function editorUpdate(editor, state, focusParents, focusSelection) {
	if (!focusParents || !focusSelection) {
		console.info("editor is updated only from focus changes");
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
	var lastFocusParents;
	var lastFocusSelection;
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
		throw new Error("Transient genId called before store.genId is setup");
	};
	editor.utils.setDom(content);

	editor.controls = {};
	for (var key in Pageboard.Controls) {
		var lKey = key.toLowerCase();
		editor.controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
	}

	return editor;
}


})(window.Pageboard);

