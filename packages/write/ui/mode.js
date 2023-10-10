Pageboard.Controls.Mode = class Mode {
	static pruneNonRoot(obj, parent, schema) {
		const nodeType = schema.nodes[obj.type];
		if (!nodeType) return obj;
		const tn = nodeType.spec.typeName;
		if (tn == null) return obj;
		const list = obj.content || [];
		let childList = [];
		list.forEach(item => {
			const list = this.pruneNonRoot(item, obj, schema);
			if (Array.isArray(list)) childList = childList.concat(list);
			else if (list != null) childList.push(list);
		});
		if (childList.length) obj.content = childList;
		if (tn == "wrap") return list;
		else return obj;
	}
	constructor(editor, node) {
		if (!Mode.singleton) {
			Mode.singleton = this;
			this.reset(editor, node);
		}
	}
	reset(editor, node) {
		this.editor = editor;
		this.node = node.parentNode;
	}

	reconnect(state) {
		state.disconnect(this, this.node);
		state.connect(this, this.node);
	}

	setup() {
		this.node.classList.remove('waiting');
	}

	handleClick(e, state) {
		const item = e.target.closest('[data-command]');
		if (!item) return;
		const com = item.dataset.command;
		if (com == "logout") {
			return state.fetch("get", "/.api/logout")
				.then(() => state.reload(true));
		}
		if (["code", "write", "read"].includes(com) == false) return;
		const mode = document.body.dataset.mode;
		if (mode != "read") {
			const store = this.editor.controls.store;
			const { response } = state.data;
			if (response?.item) {
				delete response.items;
				store.flush();
				const backup = store.reset();
				response.item = (backup.unsaved || backup.initial)[store.rootId];
				response.items = Object.values(backup.unsaved || backup.initial);
				state.scope.$store = backup; // TODO move store to some place else
				state.save();
			}
		}
		this.editor.close();
		const elts = state.scope.$elements;
		if (com == "code") {
			state.scope.$jsonContent = Mode.pruneNonRoot(
				Pageboard.editor.state.doc.toJSON(), null, Pageboard.editor.state.schema
			);
			delete Pageboard.editor;
			Pageboard.backupElements = { ...elts };
			Object.entries(elts).forEach(([name, elt]) => {
				elt = elts[name] = { ...elt };
				if (!elt.dom) return;
				if (elt.group == "page") {
					elt.stylesheets = [document.body.dataset.reset];
					elt.dom.querySelector('body').dataset.mode = "code";
					return;
				}
				if (!elt.title) return;
				delete elt.fuse;
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
		const follower = state.reload({
			vary: true,
			data: state.data
		});
		const $write = com == "write";
		follower.scope = state.scope.copy({ $write });
	}
};
