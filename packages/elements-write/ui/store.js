(function(Pageboard) {
Pageboard.Controls.Store = Store;

var IsMac = /Mac/.test(navigator.platform);

function Store(editor, node) {
	this.debounceUpdate = Pageboard.debounce(this.realUpdate, 500);
	this.node = node;
	this.editor = editor;
	this.pageId = editor.state.doc.attrs.id;

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
	Pageboard.window.addEventListener('keydown', this.keydown, false);

	this.fakeInitials = {};
	this.unsaved = this.get();

	if (this.unsaved) {
		this.restore(this.unsaved).catch(function(err) {
			Pageboard.notify("Unsaved work not readable, discarding", err);
			return this.discard();
		}.bind(this));
	}
}

Store.prototype.destroy = function() {
	delete this.editor;
	this.uiSave.removeEventListener('click', this.save);
	this.uiDiscard.removeEventListener('click', this.discard);
	window.removeEventListener('beforeunload', this.flush, false);
	window.removeEventListener('keydown', this.keydown, false);
	Pageboard.window.removeEventListener('keydown', this.keydown, false);
};

Store.generatedBefore = {};
Store.generated = {};

Store.genId =  function(len) {
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

Store.prototype.importVirtuals = function(blocks) {
	for (var id in blocks) {
		this.fakeInitials[id] = JSON.parse(JSON.stringify(
			this.editor.blocks.serializeTo(blocks[id])
		));
	}
};

Store.prototype.checkUrl = function(pageId, pageUrl) {
	// TODO use similar approach to update links when a pageUrl changes ?
	var editor = this.editor;
	return findInTreeBlock(this.initial, function(block) {
		var el = editor.element(block.type);
		return el.group == "page" && block.id != pageId && block.data.url == pageUrl;
	});
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
		var frag = this.editor.from(blocks);
		this.ignoreNext = true;
		this.editor.utils.setDom(frag);
	} catch (err) {
		this.clear();
		throw err;
	}
	this.uiUpdate();
	this.pageUpdate();
};

Store.prototype.update = function() {
	if (this.ignoreNext) {
		delete this.ignoreNext;
		return;
	}
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

	// import data into this context
	root = JSON.parse(JSON.stringify(root));

	if (!this.initial) {
		this.initial = root;
	} else {
		this.importStandalones(root);
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

Store.prototype.importStandalones = function(root, ancestor) {
	// all standalones that have not been generated in this page must be initial
	if (!root.id) return console.error("importStandalones should run on a block with id", root);
	if (root.id != this.pageId && !Store.generated[root.id]) {
		if (root.standalone || ancestor) {
			var copy = Object.assign({}, root);
			delete copy.children;
			if (!root.standalone) copy.parent = ancestor;
			ancestor = root.id;
			if (!this.fakeInitials[root.id]) this.fakeInitials[root.id] = copy;
		}
	}
	if (root.children) root.children.forEach(function(child) {
		this.importStandalones(child, ancestor);
	}, this);
};

Store.prototype.quirkStart = function(invalidatePage) {
	var prevkeys = Object.keys(Store.generated);
	if (!invalidatePage && !prevkeys.length) return;
	if (!this.unsaved) this.unsaved = {};
	if (invalidatePage) {
		this.unsaved = this.initial;
		this.initial = JSON.parse(JSON.stringify(this.initial));
		this.initial.content.body = "";
	}
	Object.assign(Store.generatedBefore, Store.generated);

	if (Object.keys(flattenBlock(this.unsaved)).length == 0) delete this.unsaved;
	this.uiUpdate();
};

Store.prototype.save = function(e) {
	this.flush();
	if (this.unsaved == null) return;
	var changes = this.changes();
	if (e && e.shiftKey) {
		console.warn("Pageboard.test - saving disabled");
		console.log(changes);
		return;
	}
	// this will queue requests and fail them all if the first one fails
	if (!this.saving) this.saving = Promise.resolve();
	var me = this;
	this.saving.then(function() {
		var p = Pageboard.fetch('put', '/.api/page', changes)
		.then(function(result) {
			if (result && result.update) result.update.forEach(function(obj, i) {
				var block = me.editor.blocks.get(obj.id);
				if (!block) throw new Error(`Missing updated block ${obj.id}`);
				block.updated_at = obj.updated_at;
				if (me.unsaved.id == obj.id) {
					me.unsaved.updated_at = obj.updated_at;
				} else {
					var child = me.unsaved.children.find(function(item) {
						return obj.id == item.id;
					});
					if (!child) throw new Error(`Missing updated child ${obj.id}`);
					child.updated_at = obj.updated_at;
				}
			});
		});
		return Pageboard.uiLoad(me.uiSave, p);
	}).then(function() {
		var unsaved = me.unsaved;
		me.reset();
		me.initial = unsaved;
		me.uiUpdate();
		me.pageUpdate();
	});
};

Store.prototype.reset = function() {
	Store.generated = {};
	Store.generatedBefore = {};
	this.clear();
	delete this.unsaved;
	delete this.editor.blocks.initial;
	delete this.initial;
};

Store.prototype.discard = function(e) {
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
};

Store.prototype.pageUpdate = function() {
	var root = this.unsaved || this.initial;
	var el = this.editor.element(root.type);
	if (el.group == "page") {
		this.editor.updatePage();
	}
};

function flattenBlock(root, ancestorId, blocks) {
	if (!blocks) blocks = {};
	var shallowCopy = Object.assign({}, root);
	if (ancestorId && ancestorId != root.id && !root.virtual) {
		shallowCopy.parent = ancestorId;
	}
	if (blocks[root.id]) {
		if (root.virtual) {
			// do nothing, that's ok !
		} else {
			// that's a cataclysmic event
			console.error("Cannot overwrite existing block", root);
		}
	} else {
		blocks[root.id] = shallowCopy;
	}
	if (root.children) {
		root.children.forEach(function(child) {
			flattenBlock(child, root.id, blocks);
		});
		delete shallowCopy.children;
	}
	// just remove page.links
	if (root.links) delete shallowCopy.links;
	return blocks;
}

function findInTreeBlock(root, fun) {
	var val = fun(root);
	if (val) return val;
	if (root.children) root.children.some(function(child) {
		var ret = findInTreeBlock(child, fun);
		if (ret) {
			val = ret;
			return true;
		}
	});
	return val;
}

function parentList(obj, block) {
	if (block.virtual) {
		return;
	}
	if (!block.parent) {
		console.warn("Cannot change relation without a parent", block.id);
		return;
	}
	var list = obj[block.parent];
	if (!list) list = obj[block.parent] = [];
	list.push(block.id);
}

Store.prototype.changes = function() {
	var kids = this.editor.blocks.initial;
	var initial = flattenBlock(this.initial);
	Object.keys(this.fakeInitials).forEach(function(id) {
		var news = flattenBlock(this.fakeInitials[id]);
		Object.keys(news).forEach(function(id) {
			if (!initial[id]) {
				initial[id] = news[id];
			}
		});
	}, this);
	var unsaved = flattenBlock(this.unsaved);
	var pageId = this.pageId;
	for (var id in Store.generatedBefore) {
		delete initial[id];
	}

	var changes = {
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

	Object.keys(unsaved).forEach(function(id) {
		var block = unsaved[id];
		if (!initial[id]) {
			if (Store.generated[id]) {
				changes.add.push(block);
				parentList(changes.relate, block);
			} else {
				console.error("Ignoring ungenerated new block", block);
			}
		} // else is dealt below
	}, this);

	Object.keys(initial).forEach(function(id) {
		var block = unsaved[id];
		var iblock = initial[id];
		if (!block) {
			if (iblock.virtual) {
				// do not remove it
			} else if (!Store.generated[id]) {
				if (iblock.parent) {
					var iparent = initial[iblock.parent];
					if (iparent && iparent.standalone && !unsaved[iblock.parent]) return;
				}
				parentList(changes.unrelate, iblock);
				if (!iblock.standalone) {
					changes.remove[id] = true;
				}
			}
		} else {
			if (block.parent != iblock.parent) {
				if (iblock.parent) parentList(changes.unrelate, iblock);
				if (block.parent) parentList(changes.relate, block);
			}
			// compare content, not parent
			delete block.parent;
			delete iblock.parent;
			delete block.virtual;
			delete iblock.virtual;
			if (!this.editor.utils.equal(iblock, block)) {
				changes.update.push(block);
			}
		}
	}, this);

	// fail-safe: compare to initial children list
	if (kids) Object.keys(kids).forEach(function(id) {
		if (changes.remove[id] || initial[id]) return; // already dealt
		var kblock = kids[id];
		if (!unsaved[id] && !kblock.standalone && !Store.generated[id] && !kblock.virtual) {
			var el = this.editor.element(kblock.type);
			if (el && !el.render) {
				// we are not going to remove this relation because
				// it is not a mistake coming from html editor, which
				// cannot insert non-rendering elements.
				return;
			}
			changes.remove[id] = true;
			parentList(changes.unrelate, {
				id: id,
				parent: kblock.parent || pageId
			});
			console.warn("removing unused block", kblock.type, kblock.id);
		}
	}, this);

	changes.remove = Object.keys(changes.remove);

	changes.add.forEach(function(block) {
		delete block.virtual;
		delete block.parent;
	});

	changes.update.forEach(function(block) {
		delete block.virtual;
		delete block.parent;
	});

	return changes;
};

})(window.Pageboard);

