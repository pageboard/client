(function(Pageboard, Pagecut) {

Pageboard.setup = function() {
	// setup "read" iframe in develop mode
	var iframe = document.createElement('iframe');
	document.getElementById('pageboard-read').appendChild(iframe);

	var loc = Page.parse(); // get a copy of state
	loc.query.develop = null;
	delete loc.query.write;

	// iframe.contentWindow will be cleared somewhere after setting iframe.src,
	// so one cannot setup a listener event just after
	iframe.onload = function() {
		iframe.contentWindow.addEventListener('pageroute', routeListener);
	};
	iframe.src = Page.format(loc);
};

function routeListener(e) {
	var win = Pageboard.window = this;
	win.removeEventListener('pageroute', routeListener);
	for (var type in Pagecut.modules) {
		if (!win.Pagecut.modules[type]) win.Pagecut.modules[type] = {};
		Object.assign(win.Pagecut.modules[type], Pagecut.modules[type]);
	}

	var doc = e.state.document;

	doc.head.insertAdjacentHTML('beforeEnd', [
		'<script src="/public/js/pagecut-editor.js"></script>',
		'<link href="/public/css/pagecut.css" rel="stylesheet">'
	].join('\n'));

	this.addEventListener('click', function(e) {
		if (Pageboard.editor) return;
		var node = e.target.closest('[block-id]');
		if (!node) return;
		if (node == win.document.documentElement) {
			node = win.document.body;
		}
		var editor = editorSetup(win, node);
		editor.menu = Pageboard.setupMenu('#menu', editor);
		editor.view.focus();
		Pageboard.editor = editor;
	});
}

function editorSetup(win, contentNode) {
	var Editor = win.Pagecut.Editor;

	var content = contentNode.cloneNode(true);
	contentNode.textContent = "";

	Editor.defaults.marks = Editor.defaults.marks.remove('link');

	var throttledSave = Throttle(save, 1000);
	var throttledUpdate = Throttle(update, 250);

	// and the editor must be running from child
	var editor = new Editor({
		place: contentNode,
		change: function(main, block) {
			// TODO
			// 1) the document should be considered a block here, so root changes are received
			// 2) update the online blocks store (which has DOM Nodes inside content, not html)
			// 3) optimization: update preview by block
			throttledSave(main, block);
		},
		update: function(main, tr) {
			var prevSel = main.view.state.selection;
			var curSel = tr.selection;
			if (prevSel.from == curSel.from && prevSel.to == curSel.to) return; // nothing changed
			var parents;
			if (curSel.from != curSel.to) {
				parents = [];
			} else {
				parents = main.parents(curSel.$from, true).map(function(item) {
					return editor.nodeToBlock(item.node.root);
				});
			}
			throttledUpdate(editor, parents);
		},
		content: content
	});

	return editor;
}

function update(editor, parents) {
	// TODO repaint breadcrumb
	var block = parents.slice(-1).pop();
	Pageboard.form.update(editor, block);
}

function save(editor, block) {
	var store = {};
	var root = editor.modules.id.to(store);
	console.log("Saving", root, store);
}

})(window.Pageboard, window.Pagecut);







	
