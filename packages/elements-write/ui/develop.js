Pageboard.elements.develop = {
	install: function(scope) {
		var $el = scope.$element;
		var orig = this.orig;
		if (!orig) orig = this.orig = {
			fuse: $el.fuse,
			scripts: $el.scripts.slice(),
			stylesheets: $el.stylesheets.slice()
		};
		var scripts = [];
		var stylesheets = [];
		$el.fuse = function(node, d, scope) {
			var meta = scope.$meta;
			if (meta && meta.writes) {
				scripts = meta.writes.scripts;
				stylesheets = meta.writes.stylesheets;
			}
			var active = !window.parent.Pageboard.editor || !window.parent.Pageboard.editor.closed;
			this.stylesheets = (active ? stylesheets : []).concat(orig.stylesheets);
			this.scripts = (active ? scripts : scripts.slice(1)).concat(orig.scripts);
			var ret = orig.fuse ? orig.fuse.call(this, node, d, scope) : node.fuse(d, scope);
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
