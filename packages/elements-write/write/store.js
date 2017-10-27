(function(Pageboard) {
Pageboard.Controls.Store = Store;

function Store(editor, selector) {
	this.debounceUpdate = Pageboard.Debounce(this.realUpdate.bind(this), 500);
	this.menu = document.querySelector(selector);
	this.editor = editor;
	this.pageId = editor.state.doc.attrs.block_id;

	this.uiSave = this.menu.querySelector('[data-command="save"]');
	this.uiSave.addEventListener('click', this.save.bind(this));
	this.uiDiscard = this.menu.querySelector('[data-command="discard"]');
	this.uiDiscard.addEventListener('click', this.discard.bind(this));

	window.addEventListener('beforeunload', this.flushUpdate.bind(this), false);

	var state = this.get();
	this.unsaved = state.blocks;

	if (this.unsaved) {
		this.restore(this.unsaved).catch(function(err) {
			Pageboard.notify("Unsaved work not readable, discarding", err);
			return this.discard();
		}.bind(this));
	}
}

Store.generated = {};

Store.genId =  function() {
	var arr = new Uint8Array(8);
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

Store.prototype.checkUrl = function(pageId, pageUrl) {
	return Object.keys(this.initial).some(function(id) {
		var block = this.initial[id];
		if (block.type != "page") return;
		return block.id != pageId && block.data.url == pageUrl;
	}, this);
};

Store.prototype.uiUpdate = function() {
	this.uiSave.classList.toggle('disabled', !this.unsaved);
	this.uiDiscard.classList.toggle('disabled', !this.unsaved);
};

Store.prototype.get = function() {
	if (!Pageboard.enableLocalStorage) return {};
	var json = window.sessionStorage.getItem(this.key());
	var state = {};
	try {
		if (json) state = JSON.parse(json);
	} catch(ex) {
		console.error("corrupted local backup for", this.key());
		this.clear();
	}
	return state;
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
	var self = this;
	return this.editor.from(blocks).then(function(frag) {
		self.ignoreNext = true;
		self.editor.utils.setDom(frag);
	}).catch(function(err) {
		self.clear();
		throw err;
	}).then(function() {
		self.uiUpdate();
		self.pageUpdate();
	});
};

Store.prototype.update = function() {
	if (this.ignoreNext) {
		delete this.ignoreNext;
		return;
	}
	this.debounceWaiting = true;
	this.debounceUpdate();
};

Store.prototype.flushUpdate = function() {
	if (this.debounceWaiting) {
		this.debounceWaiting = false;
		this.debounceUpdate.clear();
		this.realUpdate();
	}
};

Store.prototype.realUpdate = function() {
	this.debounceWaiting = false;
	var blocks = {};
	var root;
	try {
		root = this.editor.to(blocks);
	} catch(err) {
		Pageboard.notify("Impossible to store<br><a href=''>please reload</a>", err);
		delete this.unsaved;
		this.clear();
		this.uiUpdate();
		return;
	}
	delete root.children;

	// import data into this context
	var state = JSON.parse(JSON.stringify({
		blocks: blocks
	}));

	if (!this.initial) {
		this.initial = state.blocks;
	} else if (!this.editor.utils.equal(this.initial, state.blocks)) {
		this.unsaved = state.blocks;
		this.set(state);
	} else {
		delete this.unsaved;
		this.clear();
	}
	this.uiUpdate();
};

Store.prototype.quirkStart = function(invalidatePage) {
	var prevkeys = Object.keys(Store.generated);
	if (!invalidatePage && !prevkeys.length) return;
	if (!this.unsaved) this.unsaved = {};
	if (invalidatePage) {
		this.unsaved[this.pageId] = this.initial[this.pageId];
		this.initial[this.pageId] = JSON.parse(JSON.stringify(this.initial[this.pageId]));
		this.initial[this.pageId].content.body = "";
	}
	prevkeys.forEach(function(id) {
		if (id == this.pageId) {
			return;
		}
		if (this.initial[id]) {
			this.unsaved[id] = this.initial[id];
			delete this.initial[id];
			return;
		}
	}, this);
	if (Object.keys(this.unsaved).length == 0) delete this.unsaved;
	this.uiUpdate();
};

Store.prototype.save = function(e) {
	this.flushUpdate();
	if (this.unsaved == null) return;
	var changes = this.changes();
	if (e && e.shiftKey) {
		console.warn("Pageboard.test - saving disabled")
		console.log(changes);
		return;
	}
	Pageboard.uiLoad(this.uiSave, PUT('/.api/page', changes))
	.then(function(result) {
		var unsaved = this.unsaved;
		this.reset();
		this.initial = unsaved;
		this.uiUpdate();
		this.pageUpdate();
	}.bind(this));
};

Store.prototype.reset = function() {
	Store.generated = {};
	this.clear();
	delete this.unsaved;
	delete this.editor.blocks.initial;
	delete this.initial;
};

Store.prototype.discard = function(e) {
	Store.generated = {};
	this.clear();
	if (this.unsaved == null) return;
	delete this.unsaved;
	return this.restore(this.initial).catch(function(err) {
		Pageboard.notify("Impossible to restore<br><a href=''>please reload</a>", err);
	}).then(function() {
		this.uiUpdate();
		this.pageUpdate();
	}.bind(this));
};

Store.prototype.pageUpdate = function() {
	var root = this.editor.blocks.get(this.pageId);
	var el = this.editor.element(root.type);
	if (el.group == this.editor.state.doc.type.spec.group) {
		this.editor.pageUpdate(root);
	}
};

Store.prototype.changes = function() {
	var initial = this.initial;
	var unsaved = this.unsaved;
	var add = [];
	var update = [];

	Object.keys(unsaved).forEach(function(id) {
		var block = unsaved[id];
		// some blocks can be forced to be standalone, like pages
		var el = this.editor.element(block.type);
		if (el.standalone) block.standalone = true;
		if (!initial[id]) {
			if (Store.generated[id]) {
				add.push(block);
			} else {
				console.error("Ignoring ungenerated new block", block);
			}
		}
		if (block.orphan && !block.standalone) {
			console.warn(`Only a standalone block can be orphan ${block.type} ${id}`);
		}
	}, this);

	var removals = {};
	Object.keys(initial).forEach(function(id) {
		var block = unsaved[id];
		var iblock = initial[id];
		if (!block) {
			if (!iblock.orphan && !Store.generated[id]) removals[id] = iblock.type;
		} else {
			if (!this.editor.utils.equal(iblock, block)) {
				update.push(block);
			}
		}
	}, this);

	// fail-safe: compare to initial children list
	var kids = this.editor.blocks.initial;
	if (kids) Object.keys(kids).forEach(function(id) {
		var kblock = kids[id];
		if (!unsaved[id] && !kblock.orphan && !kblock.standalone && !Store.generated[id]) {
			removals[id] = kblock.type;
		}
	}, this);
	var remove = Object.keys(removals).map(function(id) {
		return {id: id, type: removals[id]};
	});

	return {
		page: this.pageId,
		remove: remove,
		add: add,
		update: update
	};
};

})(window.Pageboard);

