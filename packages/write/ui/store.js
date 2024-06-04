Pageboard.Controls.Store = class Store {
	static IsMac = /Mac/.test(navigator.platform);
	static generatedBefore = {};
	static generated = {};

	constructor(editor, node) {
		this.debounceUpdate = Page.debounce(() => this.realUpdate(), 500);
		this.node = node;
		this.editor = editor;

		this.save = this.save.bind(this);
		this.discard = this.discard.bind(this);
		this.flush = this.flush.bind(this);
		this.keydown = this.keydown.bind(this);

		this.uiSave = this.node.querySelector('[data-command="save"]');
		this.uiSave.addEventListener('click', this.save);
		this.uiDiscard = this.node.querySelector('[data-command="discard"]');
		this.uiDiscard.addEventListener('click', this.discard);

		window.addEventListener('beforeunload', this.flush, false);
		window.addEventListener('keydown', this.keydown, false);

		this.window = editor.root.defaultView;
		this.window.addEventListener('keydown', this.keydown, false);

		this.unsaved = this.get();

		if (this.unsaved) {
			this.restore(this.unsaved).catch(err => {
				Pageboard.notify("Unsaved work not readable, discarding", err);
				return this.discard();
			});
		}
	}

	destroy() {
		this.flush();
		delete this.editor;
		this.uiSave.removeEventListener('click', this.save);
		this.uiDiscard.removeEventListener('click', this.discard);
		window.removeEventListener('beforeunload', this.flush, false);
		window.removeEventListener('keydown', this.keydown, false);
		this.window.removeEventListener('keydown', this.keydown, false);
	}

	static genId(len) {
		if (!len) len = 8;
		const arr = new Uint8Array(len);
		window.crypto.getRandomValues(arr);
		let str = "", byte;
		for (let i = 0; i < arr.length; i++) {
			byte = arr[i].toString(16);
			if (byte.length == 1) byte = "0" + byte;
			str += byte;
		}
		Store.generated[str] = true;
		return str;
	}

	checkUrl(rootId, url) {
		// TODO use similar approach to update links when a pageUrl changes ?
		const editor = this.editor;
		const blocks = editor.blocks.store;
		const id = Object.keys(blocks).find(bid => {
			const block = blocks[bid];
			if (bid != rootId && block.data) {
				return block.data.url == url && editor.element(block.type).group == "page";
			}
		});
		return blocks[id];
	}

	keydown(e) {
		if ((e.ctrlKey && !e.altKey || Store.IsMac && e.metaKey) && e.key == "s") {
			e.preventDefault();
			this.save();
		}
	}

	uiUpdate() {
		this.uiSave.classList.toggle('disabled', !this.unsaved);
		this.uiDiscard.classList.toggle('disabled', !this.unsaved);
	}

	get() {
		if (!Pageboard.enableLocalStorage) return;
		const json = window.sessionStorage.getItem(this.key());
		let root;
		try {
			if (json) root = JSON.parse(json);
		} catch (ex) {
			console.error("corrupted local backup for", this.key());
			this.clear();
		}
		return root;
	}

	set(obj) {
		if (!Pageboard.enableLocalStorage) return;
		const json = JSON.stringify(obj, null, " ");
		window.sessionStorage.setItem(this.key(), json);
	}

	clear() {
		if (!Pageboard.enableLocalStorage) return;
		window.sessionStorage.removeItem(this.key());
	}

	key() {
		return "pageboard-store-" + document.location.toString();
	}

	restore(blocks) {
		try {
			const frag = this.editor.from(blocks[this.rootId], blocks);
			this.ignoreNext = true;
			this.editor.utils.setDom(frag);
		} catch (err) {
			this.clear();
			throw err;
		}
		this.uiUpdate();
		this.pageUpdate();
	}

	update(parents, sel, changed) {
		if (this.ignoreNext) {
			delete this.ignoreNext;
			return;
		}
		// if (!changed) return; // not quite ready yet...
		this.debounceWaiting = true;
		this.debounceUpdate();
	}

	flush() {
		if (this.debounceWaiting) {
			this.debounceWaiting = false;
			this.debounceUpdate.clear();
			this.realUpdate();
		}
	}

	realUpdate() {
		this.debounceWaiting = false;
		if (!this.editor) return;
		let root;
		try {
			root = this.editor.to();
		} catch (err) {
			Pageboard.notify("Impossible to store<br><a href=''>please reload</a>", err);
			delete this.unsaved;
			this.clear();
			this.uiUpdate();
			return;
		}

		this.rootId = root.id;

		root = this.flattenBlock(root);

		if (!this.initial) {
			this.initial = root;
			Store.generatedBefore = Store.generated;
		} else if (Store.isDifferentRoot(this.initial, root)) {
			this.unsaved = root;
			this.set(root);
		} else {
			delete this.unsaved;
			this.clear();
		}
		this.uiUpdate();
		this.pageUpdate();
	}

	save(e) {
		if (this.saving) return;
		this.flush();
		if (this.unsaved == null) return;
		const changes = this.changes(this.initial, this.unsaved);
		if (e?.shiftKey) {
			console.warn("Pageboard.test - saving disabled");
			// eslint-disable-next-line no-console
			console.log(changes);
			return;
		}
		this.saving = true;
		changes.recursive = true;

		const p = Page.fetch('post', '/@api/page', changes).then(result => {
			if (!result) return;
			if (result.status == 404 && result.blocks) {
				let allStandalones = true;
				result.blocks.forEach(id => {
					const block = this.editor.blocks.get(id);
					if (block?.standalone) {
						this.editor.blocks.setStandalone(block, false);
					} else {
						allStandalones = false;
					}
				});
				if (allStandalones) {
					throw new Error("Unknown standalone block - Please save again");
				}
			}
			if (result.status != 200) {
				throw result;
			}
			if (!result.update) return;
			result.update.forEach((obj, i) => {
				const block = this.editor.blocks.get(obj.id);
				const val = obj.updated_at;
				if (block) block.updated_at = val;
				else Pageboard.notify("Cannot update editor with modified block");
				const child = this.unsaved[obj.id];
				if (child) {
					child.updated_at = val;
				} else {
					Pageboard.notify("Cannot update store with modified block");
				}
			});
		}).then(() => {
			const unsaved = this.unsaved;
			this.reset();
			this.editor.blocks.initial = this.initial = unsaved;
			this.uiUpdate();
			this.pageUpdate();
			this.editor.update();
		}).finally(() => {
			this.saving = false;
		});
		return Pageboard.uiLoad(this.uiSave, p);
	}

	reset(to) {
		if (to) {
			if (to.generated) Store.generated = to.generated;
			this.rootId = to.rootId;
			this.unsaved = to.unsaved;
			this.initial = to.initial;
			this.uiUpdate();
		} else {
			to = {
				generated: Store.generated,
				unsaved: this.unsaved,
				initial: this.initial,
				rootId: this.rootId
			};
			Store.generated = {};
			Store.generatedBefore = {};
			this.clear();
			delete this.unsaved;
			if (this.editor) this.editor.blocks.initial = {};
			//delete this.initial;
		}
		return to;
	}

	discard(e) {
		const doc = this.window.document;
		const focused = doc.querySelectorAll('[block-focused][block-id]').map(
			(node) => node.getAttribute('block-id')
		).reverse();
		Store.generated = {};
		this.clear();
		Pageboard.notify.clear();
		this.flush();
		if (this.unsaved == null) return;
		delete this.unsaved;
		try {
			this.restore(this.initial);
		} catch (err) {
			Pageboard.notify("Impossible to restore<br><a href=''>please reload</a>", err);
		}
		const editor = this.editor;
		setTimeout(() => focused.some(id => {
			const node = doc.querySelector(`[block-id="${id}"]`);
			if (!node) return false;
			const sel = editor.utils.select(node);
			if (!sel) return false;
			editor.focus();
			editor.dispatch(editor.state.tr.setSelection(sel));
			return true;
		}));
	}

	pageUpdate() {
		const root = (this.unsaved || this.initial)[this.rootId];
		const el = this.editor.element(root.type);
		if (el.group == "page") {
			this.editor.updatePage();
		}
	}

	flattenBlock(root, ancestorId, blocks) {
		if (!blocks) blocks = {};
		const shallowCopy = { ...root };
		if (ancestorId && ancestorId != root.id) {
			shallowCopy.parent = ancestorId;
		}
		if (blocks[root.id]) {
			if (root.standalone) {
				// a standalone can appear multiple times
				return;
			} else {
				// that's a cataclysmic event
				console.error("Cannot overwrite existing block", root);
			}
		} else {
			blocks[root.id] = shallowCopy;
		}
		const children = root.children || root.blocks && Object.values(root.blocks);
		if (children) {
			for (const child of children) {
				this.flattenBlock(child, root.id, blocks);
			}
			if (root.children) delete shallowCopy.children;
			if (root.blocks) delete shallowCopy.blocks;
		}
		// just remove page.links
		if (root.links) delete shallowCopy.links;
		return blocks;
	}

	static parentList(obj, block) {
		if (block.virtual) {
			return;
		}
		if (!block.parent) {
			console.warn("Cannot change relation without a parent", block.id);
			return;
		}
		let list = obj[block.parent];
		if (!list) list = obj[block.parent] = [];
		list.push(block.id);
	}

	changes(initial, unsaved) {
		const els = this.editor.elements;
		const preinitial = this.preinitial;
		const pre = {};
		for (const preblock of Object.values(preinitial)) {
			Object.assign(pre, this.flattenBlock(preblock));
		}

		for (const id of Object.keys(Store.generatedBefore)) {
			delete initial[id];
		}

		const changes = {
			// blocks removed from their standalone parent (grouped by parent)
			unrelate: {},
			// non-standalone blocks unrelated from site and deleted
			remove: {},
			// any block added and related to site
			add: [],
			// block does not change parent
			update: [],
			// block add to a new standalone parent (grouped by parent)
			relate: {}
		};
		for (const [id, block] of Object.entries(unsaved)) {
			if (!initial[id] && !pre[id]) {
				if (Store.generated[id]) {
					changes.add.push({ ...block });
					Store.parentList(changes.relate, block);
				} else if (block.standalone) {
					Store.parentList(changes.relate, block);
				} else if (!unsaved[block.parent].standalone) {
					console.error("unsaved non-standalone block in non-standalone parent is not generated");
				}
			}
		}
		const dropped = {};
		const unrelated = {};
		for (const [id, iblock] of Object.entries(initial)) {
			const block = unsaved[id];
			if (!block) {
				if (!Store.generated[id]) { // not sure it must be kept
					const iparent = iblock.virtual || iblock.parent;
					const parentBlock = Store.getParentBlock(iparent, initial, pre);
					if (parentBlock.standalone) {
						if (!dropped[iparent] && !unrelated[iparent]) {
							Store.parentList(changes.unrelate, iblock);
							unrelated[id] = true;
							if (!iblock.standalone && !changes.remove[iparent]) {
								changes.remove[id] = true;
							}
						}
					} else if (!iblock.standalone) {
						if (!dropped[iparent]) {
							Store.parentList(changes.unrelate, iblock);
							unrelated[id] = true;
							changes.remove[id] = true;
						}
					} else if (unsaved[iparent]) {
						changes.remove[id] = true;
					} else {
						dropped[id] = true;
					}
				} else {
					// eslint-disable-next-line no-console
					console.debug("ignoring removed generated block", iblock);
				}
			} else {
				if (block.ignore) continue;
				const bko = { ...block };
				const bki = { ...iblock };

				if (bko.parent != bki.parent) {
					if (bki.parent) Store.parentList(changes.unrelate, bki);
					if (bko.parent) Store.parentList(changes.relate, bko);
				}
				// compare content, not parent
				const pblock = pre[id];
				if (pblock?.content) {
					// any difference in content is generated by prosemirror
					bki.content = pblock.content;
				}
				const contents = els[bko.type].contents;
				bko.content = contents.prune(bko);
				if (bko.content == null) delete bko.content;
				bki.content = contents.prune(bki);
				if (bki.content == null) delete bki.content;

				for (const key of ['lock', 'expr', 'updated_at']) {
					if (bko[key] == null && bki[key] != null) bko[key] = bki[key];
				}

				if (!bko.standalone) bko.standalone = false;
				if (!bki.standalone) bki.standalone = false;
				delete bko.parent;
				delete bki.parent;
				delete bko.virtual;
				delete bki.virtual;

				if (Pageboard.utils.stableStringify(bko) != Pageboard.utils.stableStringify(bki)) {
					changes.update.push(bko);
				}
			}
		}

		changes.remove = Object.keys(changes.remove);

		for (const block of changes.add) {
			block.content = els[block.type].contents.prune(block);
			if (block.content == null) delete block.content;
			delete block.virtual;
			delete block.parent;
		}

		for (const block of changes.update) {
			delete block.virtual;
			delete block.parent;
		}

		return changes;
	}

	static getParentBlock(id, initial, pre) {
		const parent = initial[id] || pre[id];
		if (!parent) return;
		else if (parent.virtual) return this.getParentBlock(parent.virtual, initial, pre);
		else return parent;
	}

	static isDifferentRoot(a, b) {
		const ak = Object.keys(a);
		const bk = Object.keys(b);
		if (ak.length != bk.length) return true;
		ak.sort();
		bk.sort();
		for (let i = ak.length - 1; i >= 0; i--) {
			const k = ak[i];
			if (bk[i] !== k) return true;
			if (Pageboard.utils.stableStringify(a[k]) != Pageboard.utils.stableStringify(b[k])) return true;
		}
		return false;
	}

};

