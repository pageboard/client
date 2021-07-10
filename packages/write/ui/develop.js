Pageboard.elements.develop = {
	install(pscope) {
		if (pscope.$element.fuse && pscope.$element.fuse.develop) return;
		const fuse = pscope.$element.fuse;
		pscope.$element.fuse = function(node, d, scope) {
			const $el = scope.$element;
			let scripts = [];
			let stylesheets = [];
			const meta = scope.$meta;
			if (meta && meta.writes) {
				scripts = meta.writes.scripts;
				stylesheets = meta.writes.stylesheets;
			}
			const active = window.parent.document.body.dataset.mode != "read";
			const ret = fuse ? fuse.call($el, node, d, scope) : node.fuse(d, scope);
			const body = node.querySelector('body');
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
			const frag = node.dom(`
				<link rel="stylesheet" href="[stylesheets|repeat]">
				<script defer src="[scripts|repeat]"></script>`
			).fuse({
				stylesheets: stylesheets,
				scripts: scripts
			}, scope);
			const head = node.querySelector('head');
			head.prepend(frag);
			return ret;
		};
		pscope.$element.fuse.develop = true;
	}
};
