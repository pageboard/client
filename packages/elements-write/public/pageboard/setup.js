(function(Pageboard, Pagecut) {

Pageboard.setup = function(state) {
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
		iframe.contentWindow.addEventListener('pagesetup', setupListener);
	};
	iframe.src = Page.format(loc);
};

function routeListener(e) {
	var win = Pageboard.window = this;
	Pageboard.viewer = win.Pagecut.viewerInstance;
	win.removeEventListener('pageroute', routeListener);
	for (var type in Pagecut.modules) {
		if (!win.Pagecut.modules[type]) win.Pagecut.modules[type] = {};
		Object.assign(win.Pagecut.modules[type], Pagecut.modules[type]);
	}

	var doc = e.state.document;

	doc.head.insertAdjacentHTML('beforeEnd', [
		'<script src="/public/pageboard/pagecut/editor.js"></script>',
		'<link href="/public/pageboard/read.css" rel="stylesheet">'
	].join('\n'));
}

function setupListener(e) {
	var win = this;
	this.addEventListener('click', function(e) {
		e.preventDefault();
		if (Pageboard.editor) return;
		// setup editor on whole body instead of e.target
		// setting it up on a block requires managing context (topNode in parser, probably)
		var target = e.target.ownerDocument.body;

		var editor = editorSetup(win, target, Pageboard.viewer);
		Pageboard.editor = editor;
		editor.controls = {};
		for (var key in Pageboard.Controls) {
			var lKey = key.toLowerCase();
			editor.controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
		}
		document.querySelector('#pageboard-write').removeAttribute('hidden');
	});
}

function editorSetup(win, target, viewer) {
	var node = target.closest('[block-id]');
	if (!node) return;
	var block = viewer.modules.id.get(node.getAttribute('block-id'));
	if (!block) {
		console.error("Cannot edit a block with unknown id", block.id);
		return;
	}
	var el = viewer.map[block.type];
	if (!el) {
		console.error("Cannot edit a block with unknown type", block.type);
		return;
	}
	if (el.inline) {
		node = node.parentNode.closest('[block-id]') || node;
	}
	if (node == win.document.documentElement) {
		node = win.document.body;
	}
	var Editor = win.Pagecut.Editor;

	var content = node.cloneNode(true);
	node.textContent = "";

	Editor.defaults.marks = Editor.defaults.marks.remove('link');

	// and the editor must be running from child
	var editor = new Editor({
		place: node,
		change: function(main, block) {
			// TODO
			// 1) the document should be considered a block here, so root changes are received
			// 2) update the online blocks store (which has DOM Nodes inside content, not html)
			// 3) optimization: update preview by block
		},
		update: function(main, tr) {
			if (tr.addToHistory === false || tr.ignoreUpdate) {
				return;
			}
			var sel = tr.selection;
			if (tr.steps.length == 0 && !tr.selectionSet) {
				return;
			}
			var parents = main.selectionParents(tr, sel);
			parents.forEach(function(item) {
				item.block = editor.nodeToBlock(item.root.mark || item.root.node);
			});

			if (editor.controls) Object.keys(editor.controls).forEach(function(key) {
				var c = editor.controls[key];
				if (c.update) c.update(parents);
			});
		}
	});
	editor.modules.id.store = viewer.modules.id.store;
	editor.set(content);

	return editor;
}



})(window.Pageboard, window.Pagecut);







	
