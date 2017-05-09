(function(Pageboard, Pagecut) {

Pageboard.setup = function(state) {
	var parentRead = document.getElementById('pageboard-read');
	var iframe = Pageboard.read = document.createElement('iframe');
	iframe.setAttribute('scrolling', 'no');
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
		iframe.contentWindow.addEventListener('pagesetup', setupListener);

		// resize iframe height
		iframeResizer(iframe);
		setInterval(function() {
			iframeResizer(iframe);
		}, 50);
	};
	iframe.src = Page.format(loc);
};

function setupScroll(read, write) {
	var reading = false;
	var writing = false;
	function writeDown() {
		if (writing) return;
		writing = true;
		reading = false;
		var top = -document.body.scrollTop;
		var height = read.parentNode.offsetHeight;
		// make sure top + div height >= view height
		if (top + height < document.body.offsetHeight) {
			top = document.body.offsetHeight - height;
			if (top > 0) top = 0;
		}
		Object.assign(read.parentNode.style, {
			position: 'fixed',
			height: '100%',
		});
		read.style.minHeight = null;

		Object.assign(write.style, {
			position: 'absolute',
			right: 0,
			top: null
		});
		read.contentWindow.document.body.scrollTop = -top;
	}
	function readDown(e) {
		if (reading) return;
		reading = true;
		writing = false;
		var top = read.contentWindow.document.body.scrollTop;
		Object.assign(write.style, {
			position: 'fixed',
			right: 0,
			top: 0,
			bottom: 0
		});

		Object.assign(read.parentNode.style, {
			position: 'relative',
			height: null,
			top: null
		});
		iframeResizer(read);
		document.body.scrollTop = top;
	}
	write.addEventListener('mousedown', writeDown, true);
	write.addEventListener('touchstart', writeDown, true);
	read.contentWindow.addEventListener('mousedown', readDown, false);
	read.contentWindow.addEventListener('touchstart', readDown, false);

	readDown(); // initialize with fixed write and scrolling read
}

function routeListener(e) {
	var win = Pageboard.window = this;
	Pageboard.viewer = win.Pagecut.viewerInstance;
	win.removeEventListener('pageroute', routeListener);

	var doc = e.state.document;

	doc.head.insertAdjacentHTML('beforeEnd', [
		'<script src="/public/pageboard/pagecut/editor.js"></script>',
		'<link href="/public/pageboard/read.css" rel="stylesheet">'
	].join('\n'));
}

function setupListener(e) {
	var win = this;
	var state = e.state;
	var target = win.document.body;
	// setup editor on whole body instead of e.target
	// setting it up on a block requires managing context (topNode in parser, probably)
	var editor = Pageboard.editor = editorSetup(win, target, Pageboard.viewer);

	editor.pageUpdate = pageUpdate;
	editor.controls = {};
	for (var key in Pageboard.Controls) {
		var lKey = key.toLowerCase();
		editor.controls[lKey] = new Pageboard.Controls[key](editor, '#' + lKey);
	}
	Pageboard.write.removeAttribute('hidden');
	// scroll read or write
	setupScroll(Pageboard.read, Pageboard.write);

	Page.patch(function() {
		document.title = win.document.title + (editor.controls.store.unsavedData ? '*' : '');
	});
	Page.replace({
		path: state.path
	});
}

function iframeResizer(iframe) {
	if (iframe.parentNode.style.position == "fixed") {
		iframe.style.minHeight = null;
		return;
	}
	var doc = iframe.contentWindow.document;
	var height = doc.documentElement.offsetHeight;
	var parentHeight = document.body.offsetHeight;
	if (height < parentHeight) height = parentHeight;
	iframe.style.minHeight = height + 'px';
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
		// TODO this should be handled by module id transparently
		var nodeBlock = editor.nodeToBlock(node);
		var storedBlock = editor.modules.id.get(nodeBlock.id);
		if (!storedBlock) {
			console.warn("no block for", nodeBlock);
			return;
		}
		if (!storedBlock.data) storedBlock.data = {};
		Object.assign(storedBlock.data, nodeBlock.data);
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

	// just steal the content - no need to clone deep
	var content = node.cloneNode();
	while (node.firstChild) content.appendChild(node.firstChild);

	var Editor = win.Pagecut.Editor;

	Editor.defaults.marks = Editor.defaults.marks.remove('link');
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
						iframeResizer(Pageboard.read);
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
	editor.state.doc.attrs.block_id = block.id;
	editor.set(content);

	return editor;
}


})(window.Pageboard, window.Pagecut);

