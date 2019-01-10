Page.setup(function(state) {
	HTMLCustomElement.intercept(window.HTMLElementTabs, {
		init: function() {
			if (this.menuObserver) return;
			this.menuObserver = new MutationObserver(function(mutations) {
				this._sync();
			}.bind(this));
		},
		connectedCallback: function() {
			if (window.parent.Pageboard.editor) this._setupHelper();
		},
		disconnectedCallback: function() {
			this._teardownHelper();
		},
		_setupHelper: function() {
			this._editor = window.parent.Pageboard.editor;
			this.menuObserver.observe(this.querySelector('[block-content="items"]'), {childList: true});
		},
		_teardownHelper: function() {
			this.menuObserver.disconnect();
		},
		_sync: function() {
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
		}
	});
});
