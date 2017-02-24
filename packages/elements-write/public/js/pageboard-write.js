if (!Pagecut.icons) Pagecut.icons = {};

Pagecut.icons.link = Pagecut.Menu.icons.link;

Page.setup(function(state) {

	iframeSetup();

	function iframeRoute(e) {
		var win = this;
		win.removeEventListener('pageroute', iframeRoute);
		var doc = e.state.document;
		doc.head.insertAdjacentHTML('beforeEnd', [
			'<script src="/public/js/pagecut-editor.js"></script>',
			'<link href="/public/css/pagecut.css" rel="stylesheet">'
		].join('\n'));

		this.addEventListener('click', function(e) {
			if (window.editor) return;
			var node = e.target.closest('[block-id]');
			if (!node) return;
			if (node == win.document.documentElement) {
				node = win.document.body;
			}
			window.editor = editorSetup(win, node);
			window.editor.view.focus();
		});
	}

	function iframeSetup() {
		// setup "read" iframe in develop mode
		var iframe = document.createElement('iframe');
		document.getElementById('pageboard-read').appendChild(iframe);

		var loc = Page.parse(); // get a copy of state
		loc.query.develop = null;
		delete loc.query.write;

		// iframe.contentWindow will be cleared somewhere after setting iframe.src,
		// so one cannot setup a listener event just after
		iframe.onload = function() {
			iframe.contentWindow.addEventListener('pageroute', iframeRoute);
		};
		iframe.src = Page.format(loc);
	}

	function editorSetup(win, contentNode) {
		var Editor = win.Pagecut.Editor;

		var content = contentNode.cloneNode(true);
		contentNode.textContent = "";
		// render EditorMenu in parent window, but run in editor document
		win.Pagecut.EditorMenu.prototype.init = function(main, schema) {
			var items = [];
			Object.keys(main.elements).forEach(function(name) {
				var nodeType = schema.nodes['root_' + name];
				if (!nodeType) return;
				var icon = Pagecut.icons[name];
				if (!icon) return;
				var el = main.elements[name];
				items.push(new Pagecut.Menu.MenuItem({
					title: el.name,
					onDeselected: 'disable',
					icon: icon,
					run: function(state, dispatch, view) {
						// TODO manage inline node insertion (and wrapping, but the problem is similar
						// with blocks). Use Marks ?
						// win.Pagecut.Commands.wrapIn(schema.nodes['blockquote'])(state, dispatch);
						var block = {
							id: - Date.now(),
							type: el.name,
							// TODO populate with current selection when possible
							content: {content: 'placeholder'}
						};
						main.modules.id.set(block);
						var dom = main.render(block, true);
						var frag = main.parse(dom);
						dispatch(state.tr.replaceSelectionWith(frag.content[0]));
					},
					select: function(state) {
						return canInsert(state, nodeType);
					}
				}));
			});
			this.menu = [items];
		};

		win.Pagecut.EditorMenu.prototype.update = Pagecut.EditorMenu.prototype.update;

		Editor.defaults.marks = Editor.defaults.marks.remove('link');

		var throttledSave = Throttle(save, 1000);
		var throttledUpdate = Throttle(update, 250);

		// and the editor must be running from child
		var editor = new Editor({
			menubar: document.querySelector('#menu'),
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
		editor.menu.update(editor.view);
		return editor;
	}

	function canInsert(state, nodeType, attrs) {
		var $from = state.selection.$from;
		for (var d = $from.depth; d >= 0; d--) {
			var index = $from.index(d);
			if ($from.node(d).canReplaceWith(index, index, nodeType, attrs)) {
				return true;
			}
		}
		return false;
	}

	function save(editor, block) {
		var store = {};
		var root = editor.modules.id.to(store);
		console.log("Saving", root, store);
	}

	function update(editor, parents) {
		// menu is already taken care of
		// repaint breadcrumb
		// repaint data form
		var block = parents.slice(-1).pop();
		updateForm(editor, block);
	}

	function updateForm(editor, block) {
		var $form = $('#form');
		$form.empty();
		if (!block) return;
		var el = editor.elements[block.type];
		if (!el) {
			// TODO display this block has no data to be edited
			return;
		}
		var form = new Semafor({
			type: 'object',
			properties: el.properties,
			required: el.required
		}, $form[0]);

		form.set(block.data);
		form.$node.on('change', function() {
			console.log(form.get());
		});
	}
});


