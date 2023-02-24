(function(Pageboard) {

Page.patch(state => {
	// write mode accepts all params at the moment
	for (const key of Object.keys(state.query)) {
		state.vars[key] = true;
	}
});

Page.setup(state => {
	const parentRead = document.getElementById('pageboard-read');
	const iframe = Pageboard.read = document.createElement('iframe');
	parentRead.insertBefore(iframe, parentRead.lastElementChild);
	Pageboard.write = document.getElementById('pageboard-write');
	document.body.addEventListener('submit', (e) => e.preventDefault());
	const src = state.toString();

	if (iframe.getAttribute('src') == src) return;
	iframe.setAttribute('src', src);
});

Pageboard.adopt = function(win, readState) {
	Page.setup(writeState => {
		readState.finish(() => {
			window.document.title = win.document.title;
			writeState.pathname = readState.pathname;
			writeState.query = readState.query;
			// writeState.data = readState.data;
			writeState.save();

			Pageboard.hrefs = readState.scope.$hrefs ?? {};
			if (Pageboard.editor?.closed) return;
			if (!Pageboard.modeControl) {
				Pageboard.modeControl = new Pageboard.Controls.Mode({
					// minimal editor interface expected by modeControl
					root: { defaultView: win },
					close() { }
				}, document.getElementById("mode"));
			} else if (window.document.body.dataset.mode != "read") {
				Pageboard.Editor(win, readState);
			}
		});
	});
};

function updatePage(state) {
	if (this.closed) return;
	const store = this.controls.store;
	if (!store) return;
	const page = (store.unsaved || store.initial)[store.rootId];
	if (!page || !page.data) return;
	const title = (page.data.title || "") + (store.unsaved ? '*' : '');
	const path = page.data.url;
	if (title != window.document.title || state.pathname != path) {
		state.pathname = page.data.url;
		window.document.title = title;
		state.save();
	}
}

function filterParents(editor, list) {
	const sec = [];
	for (const item of list) {
		const node = item.root.node;
		if (node.attrs.focused == null) continue;
		const obj = {
			node: node,
			block: editor.blocks.get(node.attrs.id) || editor.blocks.fromAttrs(node.attrs),
			rpos: item.root.rpos,
		};
		obj.type = node.attrs.type || obj.block.type;
		if (item.container) obj.contentName = item.container.name;
		if (item.inline) {
			obj.inline = {
				node: item.inline.node,
				blocks: item.inline.node.marks.map(mark => {
					return editor.blocks.get(mark.attrs.id) || editor.blocks.fromAttrs(mark.attrs);
				}),
				rpos: item.inline.rpos
			};
		}
		sec.push(obj);
	}
	return sec;
}

function update() {
	const editor = this;
	const tr = editor.state.tr;
	const sel = tr.selection;
	const changed = editor.docChanged;
	editor.docChanged = false;
	if (!changed && this.selection && sel.eq(this.selection)) return;
	this.selection = sel;
	const parents = filterParents(editor, editor.utils.selectionParents(tr, sel));
	if (!parents.length) return;
	if (editor.controls) for (const key of Object.keys(editor.controls)) {
		const c = editor.controls[key];
		try {
			if (c.update) c.update(parents, sel, changed);
		} catch(err) {
			Pageboard.notify(`control.${key}`, err);
		}
	}
	editor.updatePage();
}

Pageboard.Editor = function Editor(win, state) {
	const page = state.data.item;
	if (!page || page.type == "error") {
		Pageboard.write.hidden = true;
		console.warn("Not loading editor: no page or error page");
		return;
	}

	const view = state.scope.$view;
	let editor = Pageboard.editor;
	if (editor && !editor.closed) {
		editor.close();
	}
	const doc = win.document;
	const body = doc.body;
	win.Pagecut.Editor.prototype.update = update;
	window.Pagecut.MenuItem = win.Pagecut.MenuItem;
	// and the editor must be running from child
	editor = Pageboard.editor = new win.Pagecut.Editor({
		store: view.blocks.store,
		topNode: page.type,
		elements: view.elements,
		explicit: document.body.dataset.mode == "code",
		place: doc.body,
		jsonContent: state.scope.$jsonContent,
		content: body,
		genId: Pageboard.Controls.Store.genId,
		scope: state.scope,
		plugins: [{
			filterTransaction: function(tr) {
				if (tr?.docChanged && editor) editor.docChanged = true;
				return true;
			},
			view: function() {
				return {
					update: function(editor, prevState) {
						editor.update();
					}
				};
			}
		}]
	});

	editor.updatePage = updatePage.bind(editor, state);
	editor.close = editorClose.bind(editor);

	// keep runtime store in sync with editor store
	view.blocks.store = editor.blocks.store;

	const controls = {};
	for (const key of Object.keys(Pageboard.Controls)) {
		const lKey = key.toLowerCase();
		const ControlClass = Pageboard.Controls[key];
		const node = document.getElementById(lKey);
		if (ControlClass.singleton) {
			controls[key] = ControlClass.singleton;
			ControlClass.singleton.reset(editor, node);
		} else {
			controls[lKey] = new ControlClass(editor, node);
		}
	}
	editor.controls = controls;
	controls.store.preinitial = editor.blocks.initial = view.blocks.initial;
	const $store = state.scope.$store;
	if ($store) {
		controls.store.reset($store);
	}
	controls.store.realUpdate();
	return editor;
};

function editorClose() {
	this.closed = true;
	Pageboard.notify.destroy();
	this.destroy();
	for (const control of Object.values(this.controls)) {
		if (control.destroy) control.destroy();
	}
}

})(window.Pageboard);

