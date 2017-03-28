(function(Pageboard) {
Pageboard.Store = Store;

function Store(editor, selector) {
	this.$node = $(selector);
	this.editor = editor;
	this.uiSave = this.$node.find('[data-command="save"]')
		.on('click', this.save.bind(this));
	this.uiDiscard = this.$node.find('[data-command="discard"]')
		.on('click', this.discard.bind(this));
	this.unsavedData = this.get();
	if (this.unsavedData) {
		this.restore(this.unsavedData);
	}
	this.uiUpdate();
}

Store.prototype.uiUpdate = function() {
	this.uiSave.toggleClass('disabled', !this.unsavedData);
	this.uiDiscard.toggleClass('disabled', !this.unsavedData || !this.initialData);
};

Store.prototype.get = function() {
	return window.sessionStorage.getItem(this.key());
};

Store.prototype.set = function(str) {
	window.sessionStorage.setItem(this.key(), str);
};

Store.prototype.clear = function() {
	window.sessionStorage.removeItem(this.key());
};

Store.prototype.key = function() {
	return "pageboard-store-" + document.location.toString();
};

Store.prototype.restore = function(data) {
	var obj;
	try {
		obj = JSON.parse(data);
	} catch(ex) {
		this.clear();
		return;
	}
	var editor = this.editor;
	editor.modules.id.store = obj.store;
	editor.modules.id.from(obj.root).then(function(fragment) {
		// set fragment inside node with block-content, is this a workaround ?
		var content = fragment.ownerDocument.createElement("div");
		content.setAttribute('block-content', 'body');
		content.appendChild(fragment);
		this.ignoreNext = true;
		editor.set(content);
		this.uiUpdate();
	}.bind(this)).catch(function(err) {
		console.error(err);
	});
};

Store.prototype.update = function() {
	if (this.ignoreNext) {
		delete this.ignoreNext;
		return;
	}
	var editor = this.editor;
	var root = editor.modules.id.to();

	var data = JSON.stringify({
		root: root,
		store: editor.modules.id.store
	}, null, " ");

	if (!this.initialData) {
		this.initialData = data;
	} else if (this.initialData != data) {
		this.unsavedData = data;
		this.set(data);
	}
	this.uiUpdate();
};

Store.prototype.save = function(e) {
	this.initialData = this.unsavedData;
	delete this.unsavedData;

	console.log("TODO: save to /api")

	this.uiUpdate();
};

Store.prototype.discard = function(e) {
	delete this.unsavedData;
	this.clear();
	this.restore(this.initialData);
};

})(window.Pageboard);

