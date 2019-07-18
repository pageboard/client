Pageboard.Controls.Mode = class Mode {
	constructor(editor, node) {
		this.editor = editor;
		this.win = editor.root.defaultView;
		this.node = node;
		this.node.addEventListener('click', this);
	}
	handleEvent(e) {
		var item = e.target.closest('.item');
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
					state.data.$cache.item = backup.unsaved || backup.initial;
					state.data.$store = backup;
					state.save();
				}
			}
			this.editor.close();
			if (com == "code") {
				delete Pageboard.editor;
				var elts = state.scope.$view.elements;
				Pageboard.backupElements = Object.assign({}, elts);
				Object.entries(elts).forEach(([name, elt]) => {
					elt = elts[name] = elt.clone();
					if (!elt.dom) return;
					if (elt.group == "page") {
						elt.stylesheets = elt.stylesheets.slice(0, 1);
						elt.dom.querySelector('body').dataset.mode = "code";
						return;
					}
					delete elt.fuse;
					delete elt.render;
					delete elt.$installed;
					if (elt.inplace) return;
					delete elt.parse;
					delete elt.tag;
					elt.fusable = false;
					if (elt.inline) {
						if (!elt.leaf) {
							elt.dom = state.scope.$doc.dom(`<span class="${name}"></span>`);
						} else {
							elt.dom = state.scope.$doc.dom(`<span class="${name}">${elt.title}</span>`);
						}
						elt.tag = `span[block-type="${name}"]`;
					} else {
						if (elt.contents.unnamed) {
							elt.contents.list[0].id = "";
							delete elt.contents.unnamed;
						}
						elt.dom = state.scope.$doc.dom(`<div class="${name}">
							<div class="title">${elt.title}</div>
							<div class="content">
								<div block-content="[contents.list.id|repeat:div|or:]"></div>
							</div>
						</div>`).fuse(elt, state.scope);
						elt.tag = `div[block-type="${name}"]`;
					}
					elt.html = elt.dom.outerHTML;
				});
				this.node.removeEventListener('click', this);
			} else if (com == "write") {
				delete Pageboard.editor;
				this.node.removeEventListener('click', this);
			}
			if (mode == "code") {
				var elts = state.scope.$view.elements;
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
			state.reload();
		});
	}
};

