Pageboard.Controls.Mode = class Mode {
	constructor(editor, node) {
		this.editor = editor;
		this.win = editor.root.defaultView;
		this.html = this.win.document.documentElement;
		this.node = node;
		this.hop();
	}
	hop() {
		this.node.addEventListener('click', this);
		if (document.body.dataset.mode == "read") {
			this.raf(false);
			this.win.addEventListener('scroll', this);
		}
	}
	destroy() {
		this.node.removeEventListener('click', this);
		this.win.removeEventListener('scroll', this);
		delete this.html.style.transform;
		delete document.body.dataset.scrollOverTop;
	}
	handleEvent(e) {
		if (this[e.type]) this[e.type](e);
	}
	scroll() {
		var scrollTop = this.scrollTop;
		this.scrollTop = this.html.scrollTop;
		if (this.scrollTop == 0 && scrollTop == 1) this.raf(true);
		else if (this.scrollTop >= 1) this.raf(false);
	}
	apply(overTop) {
		document.body.dataset.scrollOverTop = !!overTop;
		if (overTop) {
			delete this.html.style.transform;
		} else {
			this.scrollTop = this.scrollTop || 1;
			this.html.style.transform = "translateY(1px)";
		}
		this.html.scrollTop = this.scrollTop;
	}
	raf(overTop) {
		if (document.body.dataset.scrollOverTop != overTop) {
			window.requestAnimationFrame(() => this.apply(overTop));
		}
	}
	click(e) {
		var item = e.target.closest('[data-command]');
		if (!item) return;
		var com = item.dataset.command;
		this.win.Page.setup((state) => {
			var mode = document.body.dataset.mode;
			if (mode != "read") {
				var store = this.editor.controls.store;
				if (state.data.$cache) {
					delete state.data.$cache.items;
					store.flush();
					var backup = store.reset();
					state.data.$cache.item = (backup.unsaved || backup.initial)[store.rootId];
					state.data.$cache.items = Object.values(backup.unsaved || backup.initial);
					state.data.$store = backup;
					state.save();
				}
			}
			this.editor.close();
			var elts = state.scope.$view.elements;
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
			if (com == "read") {
				this.hop();
			} else {
				this.destroy();
			}
			state.replace(state, {vary: true});
		});
	}
};

function pruneNonRoot(obj, parent, schema) {
	var nodeType = schema.nodes[obj.type];
	if (!nodeType) return obj;
	var tn = nodeType.spec.typeName;
	if (tn == null) return obj;
	var list = obj.content || [];
	var childList = [];
	list.forEach((item) => { 
		var list = pruneNonRoot(item, obj, schema);
		if (Array.isArray(list)) childList = childList.concat(list);
		else if (list != null) childList.push(list);
	});
	if (childList.length) obj.content = childList;
	if (tn == "wrap") return list;
	else return obj;
}
