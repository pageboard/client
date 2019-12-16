Pageboard.elements.develop = {
	install: function(pscope) {
		if (pscope.$element.fuse && pscope.$element.fuse.develop) return;
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
			var active = window.parent.document.body.dataset.mode != "read";
			var ret = fuse ? fuse.call($el, node, d, scope) : node.fuse(d, scope);
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
				scripts = scripts.slice(1);
				stylesheets = [];
			}
			var frag = node.dom(`
				<link rel="stylesheet" href="[stylesheets|repeat]">
				<script defer src="[scripts|repeat]"></script>`
			).fuse({
				stylesheets: stylesheets,
				scripts: scripts
			}, scope);
			var head = node.querySelector('head');
			head.prepend(frag);
			return ret;
		};
		pscope.$element.fuse.develop = true;
	}
};
