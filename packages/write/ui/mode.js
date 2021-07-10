Pageboard.Controls.Mode = class Mode {
	constructor(editor, node) {
		if (!Mode.singleton) Mode.singleton = this;
		Mode.singleton.reset(editor, node);
	}
	reset(editor, node) {
		this.editor = editor;
		this.win = editor.root.defaultView;
		this.html = this.win.document.documentElement;
		if (this.node) this.node.removeEventListener('click', this);
		this.node = node.parentNode;
		this.node.classList.remove('waiting');
		this.node.addEventListener('click', this);
	}
	handleEvent(e) {
		if (this[e.type]) this[e.type](e);
	}
	click(e) {
		const item = e.target.closest('[data-command]');
		if (!item) return;
		const com = item.dataset.command;
		if (com == "logout") {
			Page.setup(function(state) {
				return Pageboard.fetch("get", "/.api/logout").then(function() {
					state.reload(true);
				});
			});
			return;
		}
		if (["code", "write", "read"].includes(com) == false) return;
		this.win.Page.patch((state) => {
			const mode = document.body.dataset.mode;
			if (mode != "read") {
				const store = this.editor.controls.store;
				if (state.data.$cache) {
					delete state.data.$cache.items;
					store.flush();
					const backup = store.reset();
					state.data.$cache.item = (backup.unsaved || backup.initial)[store.rootId];
					state.data.$cache.items = Object.values(backup.unsaved || backup.initial);
					state.data.$store = backup;
					state.save();
				}
			}
			this.editor.close();
			const elts = state.scope.$elements;
			if (com == "code") {
				state.data.$jsonContent = pruneNonRoot(Pageboard.editor.state.doc.toJSON(), null, Pageboard.editor.schema);
				delete Pageboard.editor;
				Pageboard.backupElements = Object.assign({}, elts);
				Object.entries(elts).forEach(([name, elt]) => {
					elt = elts[name] = elt.clone();
					if (!elt.dom) return;
					if (elt.group == "page") {
						elt.stylesheets = [document.body.dataset.reset];
						elt.dom.querySelector('body').dataset.mode = "code";
						return;
					}
					if (!elt.title) return;
					delete elt.fuse;
					delete elt.render;
					delete elt.$installed;
					if (elt.inplace) return;
					delete elt.parse;
					delete elt.tag;
					elt.fusable = false;
					elt.dom.setAttribute('element-type', elt.inline ? 'inline' : 'block');
					elt.dom.setAttribute('element-title', elt.title);
					elt.dom.removeAttribute('style');
					elt.html = elt.dom.outerHTML;
					delete elt.dom;
				});
			} else if (com == "write") {
				delete Pageboard.editor;
			}
			if (mode == "code") {
				Object.entries(Pageboard.backupElements).forEach(([name, elt]) => {
					if (elt.group == "page") {
						delete elt.dom.querySelector('body').dataset.mode;
					}
					elts[name] = elt;
					delete elt.$installed;
				});
				delete Pageboard.backupElements;
			}
			document.body.dataset.mode = com;
			state.reload({
				vary: true,
				data: state.data
			});
		});
	}
};

function pruneNonRoot(obj, parent, schema) {
	const nodeType = schema.nodes[obj.type];
	if (!nodeType) return obj;
	const tn = nodeType.spec.typeName;
	if (tn == null) return obj;
	const list = obj.content || [];
	let childList = [];
	list.forEach((item) => {
		const list = pruneNonRoot(item, obj, schema);
		if (Array.isArray(list)) childList = childList.concat(list);
		else if (list != null) childList.push(list);
	});
	if (childList.length) obj.content = childList;
	if (tn == "wrap") return list;
	else return obj;
}
