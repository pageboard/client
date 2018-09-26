/* global HTMLElementTabs */
HTMLElementTabs.prototype._init = HTMLElementTabs.prototype.init;
HTMLElementTabs.prototype._connectedCallback = HTMLElementTabs.prototype.connectedCallback;
HTMLElementTabs.prototype._disconnectedCallback = HTMLElementTabs.prototype.disconnectedCallback;

HTMLElementTabs.prototype.init = function() {
	this._init();
	this._initHelper();
};

HTMLElementTabs.prototype.connectedCallback = function() {
	this._connectedCallback();
	if (window.parent.Pageboard.editor) this._setupHelper();
};

HTMLElementTabs.prototype.disconnectedCallback = function() {
	this._disconnectedCallback();
	this._teardownHelper();
};

HTMLElementTabs.prototype._initHelper = function() {
	if (this.menuObserver) return;
	this.menuObserver = new MutationObserver(function(mutations) {
		this._sync();
	}.bind(this));
};

HTMLElementTabs.prototype._setupHelper = function() {
	this._editor = window.parent.Pageboard.editor;
	this.menuObserver.observe(this.querySelector('[block-content="items"]'), {childList: true});
};

HTMLElementTabs.prototype._teardownHelper = function() {
	this.menuObserver.disconnect();
};

HTMLElementTabs.prototype._sync = function() {
	if (this._syncing || !this._editor) return;
	this._syncing = true;
	var editor = this._editor;

	var items = this.querySelector('[block-content="items"]');
	var tabs = this.querySelector('[block-content="tabs"]');
	if (!items || !tabs) return;
	var diff = items.children.length - tabs.children.length;
	if (diff == 0) return;
	var tr = editor.state.tr;
	var sel;
	if (diff > 0) {
		sel = editor.utils.selectTr(tr, tabs.lastElementChild, true);
		var pos = sel.to + 1;
		var $pos = tr.doc.resolve(pos);
		var block = editor.blocks.create('tab');
		editor.blocks.set(block);
		var dom = editor.render(block);
		var node = editor.utils.fill(editor.utils.parseTr(tr, dom, $pos).content.firstChild);
		tr.insert(pos, node);
	} else if (diff < 0) {
		sel = editor.utils.selectTr(tr, tabs.lastElementChild);
		editor.utils.deleteTr(tr, sel);
	}
	editor.dispatch(tr);

	this._syncing = false;
};

