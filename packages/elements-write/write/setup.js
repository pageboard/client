(function(Pageboard, Pagecut) {

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
	Pageboard.viewer = this.Pagecut.viewerInstance;
	this.removeEventListener('pagebuild', buildListener);
	this.document.head.insertAdjacentHTML('beforeEnd', `
	<link rel="stylesheet" href="/.pageboard/write/read.css" />
	`);
}

function setupListener(e) {
	var win = this;
	var state = e.state;
	var target = win.document.body;
	// setup editor on whole body instead of e.target
	// setting it up on a block requires managing context (topNode in parser, probably)
	var editor = Pageboard.editor = editorSetup(win, target, Pageboard.viewer);

	Pageboard.write.removeAttribute('hidden');
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

function editorUpdate(editor, state, focusParents) {
	var tr = editor.state.tr; // do not use state.tr to avoid being before modifications
	var parents = [];

	(focusParents || editor.selectionParents(tr, tr.selection)).forEach(function(item) {
		var node = item.root.mark || item.root.node;
		// TODO create pagecut#id module api to handle this
		// nodeBlock is created on demand,
		// but here we want to allow in-place modification of the stored block,
		// so it must be updated with its last known modified content and data
		var nodeBlock = editor.nodeToBlock(node);
		var storedBlock = editor.modules.id.get(nodeBlock.id);
		if (!storedBlock) {
			console.warn("no block for", nodeBlock);
			return;
		}
		if (!storedBlock.data) storedBlock.data = {};
		Object.assign(storedBlock.data, nodeBlock.data);
		if (!storedBlock.content) storedBlock.content = {};
		Object.assign(storedBlock.content, nodeBlock.content);
		item.block = storedBlock;
		parents.push(item);
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

	var content = node.cloneNode();
	while (node.firstChild) content.appendChild(node.firstChild);

	var Editor = win.Pagecut.Editor;

	Editor.defaults.marks = Editor.defaults.marks.remove('link');
	Editor.defaults.marks = Editor.defaults.marks.remove('code');
	Editor.defaults.nodes = Editor.defaults.nodes.remove('doc');

	// and the editor must be running from child
	var lastFocusParents;
	var editor = new Editor({
		topNode: 'page',
		place: node,
		plugins: [{
			filterTransaction: function(tr) {
				// filters all transactions
				var focusParents = tr.getMeta('focus-plugin');
				if (focusParents) {
					lastFocusParents = focusParents;
				}
				return true;
			},
			view: function() {
				return {
					update: function(editor, state) {
						// called after all current transactions have been applied
						editorUpdate(editor, state, lastFocusParents);
						lastFocusParents = null;
					}
				}
			}
		}]
	});
	// copy reader id module blocks
	editor.modules.id.blocks = viewer.modules.id.blocks;

	// work around not being able to parse dom as doc - we need it to carry block_id
	// TODO use editorProps 'attributes' for this ?
	editor.state.doc.attrs.block_id = block.id;
	editor.set(content);

	editor.pageUpdate = pageUpdate;

	editor.controls = {};
	for (var key in Pageboard.Controls) {
		var lKey = key.toLowerCase();
		editor.controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
	}

	return editor;
}


})(window.Pageboard, window.Pagecut);

