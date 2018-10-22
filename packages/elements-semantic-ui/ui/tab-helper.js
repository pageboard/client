(function(Proto) {

	Proto._init = Proto.init;
	Proto._connectedCallback = Proto.connectedCallback;
	Proto._disconnectedCallback = Proto.disconnectedCallback;

	Proto.init = function() {
		this._init();
		this._initHelper();
	};

	Proto.connectedCallback = function() {
		this._connectedCallback();
		if (window.parent.Pageboard.editor) this._setupHelper();
	};

	Proto.disconnectedCallback = function() {
		this._disconnectedCallback();
		this._teardownHelper();
	};

	Proto._initHelper = function() {
		if (this.menuObserver) return;
		this.menuObserver = new MutationObserver(function(mutations) {
			this._sync();
		}.bind(this));
	};

	Proto._setupHelper = function() {
		this._editor = window.parent.Pageboard.editor;
		this.menuObserver.observe(this.querySelector('[block-content="items"]'), {childList: true});
	};

	Proto._teardownHelper = function() {
		this.menuObserver.disconnect();
	};

	Proto._sync = function() {
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

})(window.HTMLElementTabs.prototype);

