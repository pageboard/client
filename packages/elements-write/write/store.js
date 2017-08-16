(function(Pageboard) {
Pageboard.Controls.Store = Store;

function Store(editor, selector) {
	editor.blocks.genId = this.genId.bind(this);
	this.menu = document.querySelector(selector);
	this.editor = editor;
	this.children = Object.keys(editor.blocks.store);
	this.pageId = editor.state.doc.attrs.block_id;

	this.uiSave = this.menu.querySelector('[data-command="save"]');
	this.uiSave.addEventListener('click', this.save.bind(this));
	this.uiDiscard = this.menu.querySelector('[data-command="discard"]');
	this.uiDiscard.addEventListener('click', this.discard.bind(this));

	this.update();
	this.unsaved = this.get();

	if (this.unsaved) {
		this.restore(this.unsaved).catch(function(err) {
			Pageboard.notify("Unsaved work not readable, discarding", err);
			return this.discard();
		}.bind(this));
	}
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
	return str;
};

Store.prototype.uiUpdate = function() {
	this.uiSave.classList.toggle('disabled', !this.unsaved);
	this.uiDiscard.classList.toggle('disabled', !this.unsaved);
};

Store.prototype.get = function() {
	var json = window.sessionStorage.getItem(this.key());
	if (!json) return;
	try {
		return JSON.parse(json);
	} catch(ex) {
		console.error("corrupted local backup for", this.key());
		this.clear();
	}
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

Store.prototype.restore = function(state) {
	var self = this;
	return this.editor.from(state.blocks).then(function(frag) {
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
		blocks: blocks
	}));

	if (!this.initial) {
		this.initial = state;
	} else if (!this.editor.utils.equal(this.initial, state)) {
		this.unsaved = state;
		this.set(state);
	} else {
		delete this.unsaved;
		this.clear();
	}
	this.uiUpdate();
};

Store.prototype.save = function(e) {
	if (this.unsaved == null) return;
	var changes = this.changes();
	if (Pageboard.test) {
		console.warn("Pageboard.test - saving disabled", changes);
		return;
	}
	Pageboard.uiLoad(this.uiSave, PUT('/.api/page', changes))
	.then(function(result) {
		this.initial = this.unsaved;
		this.children = Object.keys(this.initial);
		delete this.unsaved;
		this.clear();
		this.uiUpdate();
		this.pageUpdate();
	}.bind(this));
};

Store.prototype.discard = function(e) {
	if (this.unsaved == null) return;
	delete this.unsaved;
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
	var remove = [];
	var add = [];
	var update = [];

	var block;
	for (var id in unsaved.blocks) {
		block = unsaved.blocks[id];
		if (block.deleted) {
			console.warn("pagecut deleted this block", block);
		}
		if (block.added) {
			delete block.added;
			initial.blocks[id] = block;
		} else if (!initial.blocks[id]) {
			add.push(block);
		}
		if (block.orphan && !block.standalone) {
			console.warn(`Only a standalone block can be orphan ${block.type} ${id}`);
		}
	}

	this.children.forEach(function(id) {
		var block = unsaved.blocks[id];
		if (!block || !initial.blocks[id]) {
			remove.push({id: id});
		} else {
			if (!this.editor.utils.equal(initial.blocks[id], block)) {
				update.push(block);
			}
		}
	}, this);

	return {
		page: this.pageId,
		remove: remove,
		add: add,
		update: update
	};
};

})(window.Pageboard);

