(function(Pageboard) {
Pageboard.Controls.Store = Store;

function Store(editor, selector) {
	this.menu = document.querySelector(selector);
	this.editor = editor;
	this.pageId = editor.state.doc.attrs.block_id;

	this.uiSave = this.menu.querySelector('[data-command="save"]');
	this.uiSave.addEventListener('click', this.save.bind(this));
	this.uiDiscard = this.menu.querySelector('[data-command="discard"]');
	this.uiDiscard.addEventListener('click', this.discard.bind(this));

	this.update();
	this.unsaved = this.get();
	if (this.unsaved) {
		try {
			this.restore(this.unsaved);
		} catch(ex) {
			Pageboard.notify("Unsaved work not readable, discarding", ex);
			this.discard();
		}
	}
}

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
	var editor = this.editor;
	try {
		var frag = editor.from(state.blocks);
		this.ignoreNext = true;
		editor.utils.setDom(frag);
	} catch(ex) {
		this.clear();
		throw ex;
	}
	this.uiUpdate();
	this.pageUpdate();
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

	var state = {
		blocks: blocks
	};

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
	Pageboard.uiLoad(this.uiSave, PUT('/.api/page', this.changes()))
	.then(function(result) {
		this.initial = this.unsaved;
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
	try {
		this.restore(this.initial);
	} catch(ex) {
		console.error(ex);
		Pageboard.notify("Impossible to restore<br><a href=''>please reload</a>", ex);
	}
	this.uiUpdate();
	this.pageUpdate();
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
	for (var id in initial.blocks) {
		block = unsaved.blocks[id];
		if (!block) {
			remove.push({id: id});
		} else {
			if (!this.editor.utils.equal(initial.blocks[id], block)) {
				update.push(block);
			}
		}
	}
	for (var id in unsaved.blocks) {
		block = unsaved.blocks[id];
		if (block.deleted) {
			console.warn("pagecut deleted this block", block);
		}
		if (!initial.blocks[id]) add.push(block);
		if (block.orphan && !block.standalone) {
			throw new Error(`Only a standalone block can be orphan ${block.type} ${id}`);
		}
	}

	return {
		page: this.pageId,
		remove: remove,
		add: add,
		update: update
	};
};

})(window.Pageboard);

