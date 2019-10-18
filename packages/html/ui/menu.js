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
		document.body.addEventListener('click', (e) => {
			this.bodyClick(e, state);
		});
		this.observer = new ResizeObserver((entries, observer) => {
			var parentWidth = parseFloat(window.getComputedStyle(this).marginLeft) + this.offsetWidth;
			var menuWidth = menu.offsetWidth;
			this.classList.toggle('burger', parentWidth <= menuWidth);
		});
		this.observer.observe(this.parentNode);
	}
	close(state) {
		if (this.observer) this.observer.disconnect();
	}
	bodyClick(e, state) {
		if (this.active) {
			this.active.classList.toggle('active', false);
		}
		let item = this.lastElementChild.contains(e.target) && !e.target.closest('a') && e.target.closest('.item:not(.tosser)');
		if (item) {
			item.classList.toggle('active', true);
			this.active = item;
		}
		this.lastElementChild.classList.toggle('active', !!item);
	}
	toHelper(root) {
		var frag = root.ownerDocument.createDocumentFragment();
		Array.from(root.children).forEach((item) => {
			frag.append(item.cloneNode(true));
		});
		return frag;
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-menu', HTMLElementMenu);
});
