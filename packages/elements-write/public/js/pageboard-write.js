Page.setup(function(state) {
	// setup "read" iframe in develop mode
	var iframe = document.createElement('iframe');
	document.getElementById('pageboard-read').appendChild(iframe);

	var loc = Page.parse();
	loc.query.develop = null;
	delete loc.query.write;

	// iframe.contentWindow will be cleared somewhere after setting iframe.src,
	// so one cannot setup a listener event just after
	iframe.onload = function() {
		iframe.contentWindow.addEventListener('pageroute', iframeRoute);
	};
	iframe.src = Page.format(loc);

	function iframeRoute(e) {
		var win = this;
		win.removeEventListener('pageroute', iframeRoute);
		var doc = e.state.document;
		doc.head.insertAdjacentHTML('beforeend', [
			'<script src="/public/js/pagecut-editor.js"></script',
			'link href="/public/css/pagecut.css" rel="stylesheet">'
		].join('>\n<'));

		this.addEventListener('click', function(e) {
			if (window.editor) return;
			var node = e.target.closest('[block-id]');
			if (!node) return;
			if (node == win.document.documentElement) {
				node = win.document.body;
			}
			window.editor = editorSetup(this, node);
		});
	}

	function editorSetup(win, contentNode) {
		var content = contentNode.cloneNode(true);
		contentNode.textContent = "";

		// EditorMenu must be running from parent
		win.Pagecut.Editor.EditorMenu = Pagecut.Editor.EditorMenu;

		// and the editor must be running from child
		var editor = new win.Pagecut.Editor({
			menubar: document.querySelector('.pagecut-menu'),
			place: contentNode,
			change: function(me, block) {
				// TODO
				// 1) the document should be considered a block here, so root changes are received
				// 2) update the online blocks store (which has DOM Nodes inside content, not html)
				// 3) optimization: update preview by block

				// console.log(block);
			},
			content: content
		});
		editor.menu.update(editor.view);
		return editor;
	}
});
