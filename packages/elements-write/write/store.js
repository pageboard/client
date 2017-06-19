(function(Pageboard) {
Pageboard.Controls.Store = Store;

function Store(editor, selector) {
	this.menu = document.querySelector(selector);
	this.editor = editor;
	editor.modules.id.genId = Pageboard.genId;
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
		var frag = editor.modules.id.from(state.root, state.blocks);
		this.ignoreNext = true;
		editor.set(frag);
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
		root = this.editor.modules.id.to(blocks);
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
		root: root,
		blocks: blocks
	};

	if (!this.initial) {
		this.initial = state;
	} else if (!equal(this.initial, state)) {
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
	var changes = getChanges(this.initial, this.unsaved);
	Pageboard.uiLoad(this.uiSave, PUT('/.api/page', changes))
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
	// keep in mind edited document will not always be the whole page
	var state = this.unsaved || this.initial;
	var el = this.editor.map[state.root.type];
	if (el.group == this.editor.state.doc.type.spec.group) {
		this.editor.pageUpdate(state.root);
	}
};

function getChanges(initial, unsaved) {
	var remove = [];
	var add = [];
	var update = [];

	var block;
	for (var id in initial.blocks) {
		block = unsaved.blocks[id];
		if (!block) {
			remove.push({id: id});
		} else {
			if (!equal(initial.blocks[id], block)) {
				update.push(block);
			}
		}
	}
	for (var id in unsaved.blocks) {
		block = unsaved.blocks[id];
		if (!initial.blocks[id]) add.push(block);
		if (block.orphan && !block.standalone) {
			throw new Error(`Only a standalone block can be orphan ${block.type} ${id}`);
		}
	}

	return {
		page: unsaved.root.id,
		remove: remove,
		add: add,
		update: update
	};
}

})(window.Pageboard);

