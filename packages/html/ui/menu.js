Page.patch(function(state) {
	state.finish(function() {
		Array.prototype.forEach.call(
			document.querySelectorAll('.ui.menu [href]'),
			function(item) {
				var loc = item.getAttribute('href');
				if (loc) {
					loc = Page.parse(loc);
					loc.query.develop = state.query.develop;
					if (Page.samePath(loc, state)) {
						item.classList.add('active');
					}
				}
			}
		);
	});
});

class HTMLElementMenu extends HTMLCustomElement {
	setup(state) {
		if (this.isContentEditable || this.matches('.vertical')) return;
		const menu = this.firstElementChild;
		const helper =  this.lastElementChild;
		helper.lastElementChild.lastElementChild.appendChild(this.toHelper(menu));
		Page.connect({
			handleClick: (e, state) => this.anyClick(e, state)
		}, document);
		this.observer = new ResizeObserver((entries, observer) => {
			var styles = window.getComputedStyle(this);
			var parentWidth = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight) + this.offsetWidth;
			var menuWidth = menu.offsetWidth;
			this.classList.toggle('burger', parentWidth <= menuWidth);
		});
		this.observer.observe(this.parentNode);
	}
	close(state) {
		if (this.observer) this.observer.disconnect();
	}
	anyClick(e, state) {
		if (this.active) {
			this.active.classList.toggle('active', false);
		}
		var tosser = this.lastElementChild;
		tosser.classList.remove('inactive');
		let item = tosser.contains(e.target) && !e.target.closest('a') && e.target.closest('.item');
		if (item == tosser) {
			if (tosser.classList.contains('active')) {
				this.active = item = null;
				tosser.classList.add('inactive');
				tosser.blur();
			} else {
				var padding = this.offsetTop + this.offsetHeight;
				var menu = tosser.lastElementChild.lastElementChild;
				menu.style.maxHeight = `calc(100% - ${padding}px)`;
			}
		} else if (item) {
			this.active = item != this.active ? item : null;
			item.classList.toggle('active', !!this.active);
			if (!this.active) item.blur();
		}
		tosser.classList.toggle('active', !!item);
	}
	toHelper(root) {
		var frag = root.ownerDocument.createDocumentFragment();
		root.children.forEach((item) => {
			frag.append(item.cloneNode(true));
		});
		return frag;
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-menu', HTMLElementMenu);
});
