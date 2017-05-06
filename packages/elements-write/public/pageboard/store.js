(function(Pageboard) {
Pageboard.Controls.Store = Store;

function Store(editor, selector) {
	this.menu = document.querySelector(selector);
	this.editor = editor;
	editor.modules.id.genId = this.genId;
	this.uiSave = this.menu.querySelector('[data-command="save"]');
	this.uiSave.addEventListener('click', this.save.bind(this));
	this.uiDiscard = this.menu.querySelector('[data-command="discard"]');
	this.uiDiscard.addEventListener('click', this.discard.bind(this));

	this.update();
	if (this.unsaved) {
		try {
			this.restore(this.unsaved);
		} catch(ex) {
			Pageboard.notify("Unsaved work not readable, discarding", ex);
		}
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
	var editor = this.editor;
	try {
		var frag = editor.modules.id.from(state.root, state.blocks);
		this.ignoreNext = true;
		editor.set(frag);
	} catch(ex) {
		this.clear();
		throw ex;
	}

	// keep in mind edited document will not always be the whole page
	if (state.root.type == editor.state.doc.type.name) {
		editor.pageUpdate(block);
	}
};

Store.prototype.update = function() {
	if (this.ignoreNext) {
		delete this.ignoreNext;
		return;
	}
	var blocks = {};

	var root = this.editor.modules.id.to(blocks);
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
	}
	this.uiUpdate();
};

Store.prototype.save = function(e) {
	var changes = getChanges(this.initial, this.unsaved);
	Pageboard.uiLoad(this.uiSave, PUT('/api/page', changes))
	.then(function(result) {
		console.log(result);
		this.initial = this.unsaved;
		delete this.unsaved;
		this.uiUpdate();
	}.bind(this));
};

Store.prototype.discard = function(e) {
	delete this.unsaved;
	this.clear();
	try {
		this.restore(this.initial);
	} catch(ex) {
		Pageboard.notify("Impossible to restore<br><a href=''>please reload</a>", ex);
	}
	delete this.unsaved;
	this.uiUpdate();
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
		if (!initial.blocks[id]) add.push(unsaved.blocks[id]);
	}

	return {
		id: unsaved.root.id,
		remove: remove,
		add: add,
		update: update
	};
}

})(window.Pageboard);

