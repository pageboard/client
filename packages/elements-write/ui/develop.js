Pageboard.elements.develop = {
	install: function(pscope) {
		// FIXME do not redefine fuse each time this gets executed
		var fuse = pscope.$element.fuse;
		pscope.$element.fuse = function(node, d, scope) {
			var $el = scope.$element;
			var scripts = [];
			var stylesheets = [];
			var meta = scope.$meta;
			if (meta && meta.writes) {
				scripts = meta.writes.scripts;
				stylesheets = meta.writes.stylesheets;
			}
			var active = window.parent.document.body.dataset.mode == "write";
			$el.stylesheets = (active ? stylesheets : []).concat($el.stylesheets);
			$el.scripts = (active ? scripts : scripts.slice(1)).concat($el.scripts);
			var ret = fuse.call($el, node, d, scope);
			var body = node.querySelector('body');
			if (active) {
				body.classList.add('ProseMirror');
				body.setAttribute('contenteditable', 'true');
				body.setAttribute('spellcheck', 'false');
				scope.$write = true;
			} else {
				body.classList.remove('ProseMirror');
				body.removeAttribute('contenteditable');
				body.removeAttribute('spellcheck');
				scope.$write = false;
			}
			return ret;
		};
	}
};
