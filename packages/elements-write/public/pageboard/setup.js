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
	var state = e.state;
	this.addEventListener('click', function(e) {
		e.preventDefault();
		if (Pageboard.editor) return;
		Page.patch(function() {
			document.title = win.document.title + (editor.controls.store.unsavedData ? '*' : '');
		});
		Page.replace({
			path: state.path
		});
		// setup editor on whole body instead of e.target
		// setting it up on a block requires managing context (topNode in parser, probably)
		var target = e.target.ownerDocument.body;

		var editor = editorSetup(win, target, Pageboard.viewer);
		Pageboard.editor = editor;
		editor.pageUpdate = pageUpdate;
		editor.controls = {};
		for (var key in Pageboard.Controls) {
			var lKey = key.toLowerCase();
			editor.controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
		}
		document.querySelector('#pageboard-write').removeAttribute('hidden');
	});
}

function pageUpdate(page) {
	this.root.title = page.data.title;
	Page.replace({
		pathname: page.data.url,
		query: Page.state.query
	});
	editorUpdate(this);
}

function editorUpdate(editor, state) {
	var tr = editor.state.tr; // do not use state.tr to avoid being before modifications
	var parents = editor.selectionParents(tr, tr.selection);
	parents.forEach(function(item) {
		item.block = editor.modules.id.get((item.root.mark || item.root.node).attrs.block_id);
	});
	if (editor.controls) Object.keys(editor.controls).forEach(function(key) {
		var c = editor.controls[key];
		if (c.update) c.update(parents);
	});
	Page.replace(Page.state);
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

	// just steal the content - no need to clone deep
	var content = node.cloneNode();
	while (node.firstChild) content.appendChild(node.firstChild);

	var Editor = win.Pagecut.Editor;

	Editor.defaults.marks = Editor.defaults.marks.remove('link');
	Editor.defaults.nodes = Editor.defaults.nodes.remove('doc');

	// and the editor must be running from child
	var editor = new Editor({
		topNode: 'page',
		place: node,
		plugins: [{
			update: editorUpdate
		}]
	});
	editor.modules.id.store = viewer.modules.id.store;
	// work around not being able to parse dom as doc - we need it to carry block_id
	editor.state.doc.attrs.block_id = block.id;
	editor.set(content);

	return editor;
}



})(window.Pageboard, window.Pagecut);







	
