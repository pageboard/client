(function(Pageboard) {
Pageboard.Controls.Store = Store;

var IsMac = /Mac/.test(navigator.platform);

function Store(editor, node) {
	this.debounceUpdate = Pageboard.debounce(this.realUpdate, 500);
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
		this.restore(this.unsaved).catch(function(err) {
			Pageboard.notify("Unsaved work not readable, discarding", err);
			return this.discard();
		}.bind(this));
	}
}

Store.prototype.destroy = function() {
	this.flush();
	delete this.editor;
	this.uiSave.removeEventListener('click', this.save);
	this.uiDiscard.removeEventListener('click', this.discard);
	window.removeEventListener('beforeunload', this.flush, false);
	window.removeEventListener('keydown', this.keydown, false);
	this.window.removeEventListener('keydown', this.keydown, false);
};

Store.generatedBefore = {};
Store.generated = {};

Store.genId = function(len) {
	if (!len) len = 8;
	var arr = new Uint8Array(len);
	window.crypto.getRandomValues(arr);
	var str = "", byte;
	for (var i=0; i < arr.length; i++) {
		byte = arr[i].toString(16);
		if (byte.length == 1) byte = "0" + byte;
		str += byte;
	}
	Store.generated[str] = true;
	return str;
};

Store.prototype.checkUrl = function(rootId, url) {
	// TODO use similar approach to update links when a pageUrl changes ?
	var editor = this.editor;
	var blocks = editor.blocks.store;
	var id = Object.keys(blocks).find((bid) => {
		var block = blocks[bid];
		if (bid != rootId && block.data) {
			return block.data.url == url && editor.element(block.type).group == "page";
		}
	});
	return blocks[id];
};

Store.prototype.keydown = function(e) {
	if ((e.ctrlKey && !e.altKey || IsMac && e.metaKey) && e.key == "s") {
		e.preventDefault();
		this.save();
	}
};

Store.prototype.uiUpdate = function() {
	this.uiSave.classList.toggle('disabled', !this.unsaved);
	this.uiDiscard.classList.toggle('disabled', !this.unsaved);
};

Store.prototype.get = function() {
	if (!Pageboard.enableLocalStorage) return;
	var json = window.sessionStorage.getItem(this.key());
	var root;
	try {
		if (json) root = JSON.parse(json);
	} catch(ex) {
		console.error("corrupted local backup for", this.key());
		this.clear();
	}
	return root;
};

Store.prototype.set = function(obj) {
	if (!Pageboard.enableLocalStorage) return;
	var json = JSON.stringify(obj, null, " ");
	window.sessionStorage.setItem(this.key(), json);
};

Store.prototype.clear = function() {
	if (!Pageboard.enableLocalStorage) return;
	window.sessionStorage.removeItem(this.key());
};

Store.prototype.key = function() {
	return "pageboard-store-" + document.location.toString();
};

Store.prototype.restore = function(blocks) {
	try {
		var frag = this.editor.from(blocks[this.rootId], blocks);
		this.ignoreNext = true;
		this.editor.utils.setDom(frag);
	} catch (err) {
		this.clear();
		throw err;
	}
	this.uiUpdate();
	this.pageUpdate();
};

Store.prototype.update = function(parents, sel, changed) {
	if (this.ignoreNext) {
		delete this.ignoreNext;
		return;
	}
	// if (!changed) return; // not quite ready yet...
	this.debounceWaiting = true;
	this.debounceUpdate();
};

Store.prototype.flush = function() {
	if (this.debounceWaiting) {
		this.debounceWaiting = false;
		this.debounceUpdate.clear();
		this.realUpdate();
	}
};

Store.prototype.realUpdate = function() {
	this.debounceWaiting = false;
	if (!this.editor) return;
	var root;
	try {
		root = this.editor.to();
	} catch(err) {
		Pageboard.notify("Impossible to store<br><a href=''>please reload</a>", err);
		delete this.unsaved;
		this.clear();
		this.uiUpdate();
		return;
	}

	this.rootId = root.id;

	root = flattenBlock(root);

	if (!this.initial) {
		this.initial = root;
		Store.generatedBefore = Store.generated;
	} else {
		if (!this.editor.utils.equal(this.initial, root)) {
			this.unsaved = root;
			this.set(root);
		} else {
			delete this.unsaved;
			this.clear();
		}
	}
	this.uiUpdate();
	this.pageUpdate();
};

Store.prototype.save = function(e) {
	if (this.saving) return;
	this.flush();
	if (this.unsaved == null) return;
	var changes = this.changes(this.initial, this.unsaved);
	if (e && e.shiftKey) {
		console.warn("Pageboard.test - saving disabled");
		console.log(changes);
		return;
	}
	this.saving = true;
	changes.recursive = true;

	var p = Pageboard.fetch('put', '/.api/page', changes)
	.then((result) => {
		if (!result) return;
		if (result.status != 200) {
			throw result;
		}
		if (!result.update) return;
		result.update.forEach((obj, i) => {
			var block = this.editor.blocks.get(obj.id);
			var val = obj.updated_at;
			if (block) block.updated_at = val;
			else Pageboard.notify("Cannot update editor with modified block");
			var child = this.unsaved[obj.id];
			if (child) {
				child.updated_at = val;
			} else {
				Pageboard.notify("Cannot update store with modified block");
			}
		});
	}).then(() => {
		var unsaved = this.unsaved;
		this.reset();
		this.initial = unsaved;
		this.uiUpdate();
		this.pageUpdate();
		this.editor.update();
	}).finally(() => {
		this.saving = false;
	});
	return Pageboard.uiLoad(this.uiSave, p);
};

Store.prototype.reset = function(to) {
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
		delete this.editor.blocks.initial;
		delete this.initial;
	}
	return to;
};

Store.prototype.discard = function(e) {
	var doc = this.window.document;
	var focused = doc.querySelectorAll('[block-focused][block-id]').map(function(node) {
		return node.getAttribute('block-id');
	}).reverse();
	Store.generated = {};
	this.clear();
	Pageboard.notify.clear();
	this.flush();
	if (this.unsaved == null) return;
	delete this.unsaved;
	try {
		this.restore(this.initial);
	} catch(err) {
		Pageboard.notify("Impossible to restore<br><a href=''>please reload</a>", err);
	}
	var editor = this.editor;
	setTimeout(function() {
		focused.some(function(id) {
			var node = doc.querySelector(`[block-id="${id}"]`);
			if (!node) return false;
			var sel = editor.utils.select(node);
			if (!sel) return false;
			editor.focus();
			editor.dispatch(editor.state.tr.setSelection(sel));
			return true;
		});
	});
};

Store.prototype.pageUpdate = function() {
	var root = (this.unsaved || this.initial)[this.rootId];
	var el = this.editor.element(root.type);
	if (el.group == "page") {
		this.editor.updatePage();
	}
};

function flattenBlock(root, ancestorId, blocks) {
	if (!blocks) blocks = {};
	const shallowCopy = Object.assign({}, root);
	if (ancestorId && ancestorId != root.id) {
		shallowCopy.parent = ancestorId;
	}
	if (blocks[root.id]) {
		if (root.standalone) {
			// do nothing, that's ok !
		} else {
			// that's a cataclysmic event
			console.error("Cannot overwrite existing block", root);
		}
	} else {
		blocks[root.id] = shallowCopy;
	}
	let children = root.children || root.blocks && Object.values(root.blocks);
	if (children) {
		children.forEach(function(child) {
			flattenBlock(child, root.id, blocks);
		});
		if (root.children) delete shallowCopy.children;
		if (root.blocks) delete shallowCopy.blocks;
	}
	// just remove page.links
	if (root.links) delete shallowCopy.links;
	return blocks;
}

function parentList(obj, block) {
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

Store.prototype.changes = function(initial, unsaved) {
	const els = this.editor.elements;
	const preinitial = this.preinitial;
	const pre = {};
	Object.keys(preinitial).forEach(function(id) {
		Object.assign(pre, flattenBlock(preinitial[id]));
	});

	for (let id in Store.generatedBefore) {
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

	Object.keys(unsaved).forEach((id) => {
		const block = unsaved[id];
		if (!initial[id] && !pre[id]) {
			if (Store.generated[id]) {
				changes.add.push(Object.assign({}, block));
				parentList(changes.relate, block);
			} else if (block.standalone) {
				parentList(changes.relate, block);
			} else if (!unsaved[block.parent].standalone) {
				console.error("unsaved non-standalone block in non-standalone parent is not generated");
			}
		}
	});
	const dropped = {};
	const unrelated = {};
	Object.keys(initial).forEach((id) => {
		let block = unsaved[id];
		let iblock = initial[id];
		if (!block) {
			if (!Store.generated[id]) { // not sure it must be kept
				let iparent = iblock.virtual || iblock.parent;
				let parentBlock = getParentBlock(iparent, initial, pre);
				if (parentBlock.standalone) {
					if (!dropped[iparent] && !unrelated[iparent]) {
						parentList(changes.unrelate, iblock);
						unrelated[id] = true;
						if (!iblock.standalone && !changes.remove[iparent]) {
							changes.remove[id] = true;
						}
					}
				} else {
					if (!iblock.standalone) {
						if (!dropped[iparent]) {
							parentList(changes.unrelate, iblock);
							unrelated[id] = true;
							changes.remove[id] = true;
						}
					} else if (unsaved[iparent]) {
						changes.remove[id] = true;
					} else {
						dropped[id] = true;
					}
				}
			} else {
				console.info("ignoring removed generated block", iblock);
			}
		} else {
			if (block.ignore) return;
			block = Object.assign({}, block);
			iblock = Object.assign({}, iblock);

			if (block.parent != iblock.parent) {
				if (iblock.parent) parentList(changes.unrelate, iblock);
				if (block.parent) parentList(changes.relate, block);
			}
			// compare content, not parent
			let pblock = pre[id];
			if (pblock && pblock.content) {
				// any difference in content is generated by prosemirror
				iblock.content = pblock.content;
			}
			const contents = els[block.type].contents;
			block.content = contents.prune(block);
			if (block.content == null) delete block.content;
			iblock.content = contents.prune(iblock);
			if (iblock.content == null) delete iblock.content;

			['lock', 'expr', 'updated_at'].forEach((key) => {
				if (block[key] == null && iblock[key] != null) block[key] = iblock[key];
			});

			if (!block.standalone) block.standalone = false;
			if (!iblock.standalone) iblock.standalone = false;
			delete block.parent;
			delete iblock.parent;
			delete block.virtual;
			delete iblock.virtual;

			if (!this.editor.utils.equal(iblock, block)) {
				changes.update.push(block);
			}
		}
	});

	changes.remove = Object.keys(changes.remove);

	changes.add.forEach(function(block) {
		block.content = els[block.type].contents.prune(block);
		if (block.content == null) delete block.content;
		delete block.virtual;
		delete block.parent;
	});

	changes.update.forEach(function(block) {
		delete block.virtual;
		delete block.parent;
	});

	return changes;
};

function getParentBlock(id, initial, pre) {
	let parent = initial[id] || pre[id];
	if (!parent) return;
	else if (parent.virtual) return getParentBlock(parent.virtual, initial, pre);
	else return parent;
}

})(window.Pageboard);

