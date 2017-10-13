(function(Pageboard) {
Pageboard.Controls.Store = Store;

function Store(editor, selector) {
	editor.blocks.genId = this.genId.bind(this);
	this._blocksSet = editor.blocks.set;
	editor.blocks.set = this.blocksSet.bind(this);
	this.debounceUpdate = Pageboard.Debounce(this.realUpdate.bind(this), 2000);
	this.menu = document.querySelector(selector);
	this.editor = editor;
	this.pageId = editor.state.doc.attrs.block_id;

	this.uiSave = this.menu.querySelector('[data-command="save"]');
	this.uiSave.addEventListener('click', this.save.bind(this));
	this.uiDiscard = this.menu.querySelector('[data-command="discard"]');
	this.uiDiscard.addEventListener('click', this.discard.bind(this));

	this.realUpdate();
	var state = this.get();
	this.unsaved = state.blocks;
	this.ids = state.ids || {};

	if (this.unsaved) {
		this.restore(this.unsaved).catch(function(err) {
			Pageboard.notify("Unsaved work not readable, discarding", err);
			return this.discard();
		}.bind(this));
	}

	window.addEventListener('beforeunload', this.flushUpdate.bind(this), false);
}

Store.prototype.genId = function() {
	var arr = new Uint8Array(8);
	window.crypto.getRandomValues(arr);
	var str = "", byte;
	for (var i=0; i < arr.length; i++) {
		byte = arr[i].toString(16);
		if (byte.length == 1) byte = "0" + byte;
		str += byte;
	}
	this.ids[str] = true;
	return str;
};

Store.prototype.blocksSet = function(data) {
	var blocks = this.editor.blocks;
	data = this._blocksSet.call(blocks, data);
	data.forEach(function(block) {
		if (block.standalone) this.initial[block.id] = JSON.parse(JSON.stringify(blocks.copy(block)));
	}, this);
};

Store.prototype.uiUpdate = function() {
	this.uiSave.classList.toggle('disabled', !this.unsaved);
	this.uiDiscard.classList.toggle('disabled', !this.unsaved);
};

Store.prototype.get = function() {
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
	var json = JSON.stringify(obj, null, " ");
	window.sessionStorage.setItem(this.key(), json);
};

Store.prototype.clear = function() {
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
	} catch(ex) {
		console.error(ex);
		Pageboard.notify("Impossible to store<br><a href=''>please reload</a>", ex);
		delete this.unsaved;
		this.clear();
		this.uiUpdate();
		return;
	}
	delete root.children;

	// import data into this context
	var state = JSON.parse(JSON.stringify({
		blocks: blocks,
		ids: this.ids
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
		this.initial = this.unsaved;
		delete this.unsaved;
		this.ids = {};
		this.clear();
		this.uiUpdate();
		this.pageUpdate();
	}.bind(this));
};

Store.prototype.discard = function(e) {
	if (this.unsaved == null) return;
	delete this.unsaved;
	this.ids = {};
	this.clear();
	return this.restore(this.initial).catch(function(err) {
		console.error(err);
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

	var ids = this.ids;

	Object.keys(unsaved).forEach(function(id) {
		var block = unsaved[id];
		// some blocks can be forced to be standalone, like pages
		var el = this.editor.element(block.type);
		if (el.standalone) block.standalone = true;
		if (ids[id]) {
			add.push(block);
		}
		if (block.orphan && !block.standalone) {
			console.warn(`Only a standalone block can be orphan ${block.type} ${id}`);
		}
	}, this);

	var removals = {};
	Object.keys(initial).forEach(function(id) {
		var block = unsaved[id];
		if (!block) {
			if (!initial[id].orphan) removals[id] = true;
		} else {
			if (!this.editor.utils.equal(initial[id], block)) {
				update.push(block);
			}
		}
	}, this);

	// fail-safe: compare to initial children list
	var kids = this.editor.blocks.store;
	Object.keys(kids).forEach(function(id) {
		if (!unsaved[id] && !kids[id].orphan) {
			removals[id] = true;
		}
	}, this);
	var remove = Object.keys(removals).map(function(id) {
		return {id: id};
	});

	return {
		page: this.pageId,
		remove: remove,
		add: add,
		update: update
	};
};

})(window.Pageboard);

