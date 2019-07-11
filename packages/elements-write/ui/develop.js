Pageboard.elements.develop = {
	install: function(pscope) {
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
			var active = !window.parent.Pageboard.editor || !window.parent.Pageboard.editor.closed;
			$el.stylesheets = (active ? stylesheets : []).concat($el.stylesheets);
			$el.scripts = (active ? scripts : scripts.slice(1)).concat($el.scripts);
			var ret = fuse.call($el, node, d, scope);
			if (active) {
				var body = node.querySelector('body');
				body.classList.add('ProseMirror');
				body.setAttribute('contenteditable', 'true');
				body.setAttribute('spellcheck', 'false');
				scope.$write = true;
			} else {
				scope.$write = false;
			}
			return ret;
		};
	}
};
