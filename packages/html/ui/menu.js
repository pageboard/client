class HTMLElementMenu extends Page.Element {
	static patch(state) {
		function isSameOrParent(loc, state, isItem) {
			if (!state.sameDomain(loc)) {
				return false;
			} else if (state.samePathname(loc)) {
				if (!isItem && !loc.search || state.sameQuery(loc)) return true;
			} else {
				return state.pathname.startsWith(loc.pathname + '/');
			}
		}
		state.finish(() => {
			for (const item of document.querySelectorAll('[block-type="menu"] [href]')) {
				const loc = item.getAttribute('href');
				if (!loc) continue;
				if (isSameOrParent(Page.parse(loc), state, item.matches('.item'))) {
					item.classList.add('active');
				}
			}
		});
	}
	setup(state) {
		if (this.isContentEditable || this.matches('.vertical')) return;
		const menu = this.firstElementChild;
		const helper = this.lastElementChild;
		if (helper == menu) {
			// not a popup
			return;
		}
		helper.lastElementChild.lastElementChild.appendChild(this.toHelper(menu));
		state.finish(() => {
			this.observer = new ResizeObserver((entries, observer) => {
				window.requestAnimationFrame(() => {
					const styles = window.getComputedStyle(this);
					const parentWidth = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight) + this.offsetWidth;
					const menuWidth = menu.offsetWidth;
					this.classList.toggle('burger', menuWidth >= parentWidth);
				});
			});
			this.observer.observe(this.parentNode);
		});
	}
	close(state) {
		if (this.observer) this.observer.disconnect();
	}
	handleAllClick(e, state) {
		const tosser = this.lastElementChild;
		if (tosser == this.firstElementChild) {
			// not a popup
			return;
		}
		if (this.active) {
			this.active.classList.toggle('active', false);
		}
		tosser.classList.remove('inactive');
		let item = tosser.contains(e.target) && !e.target.closest('a') && e.target.closest('.item');
		if (item == tosser) {
			if (tosser.classList.contains('active')) {
				this.active = item = null;
				tosser.classList.add('inactive');
				tosser.blur();
			} else {
				const placer = tosser.lastElementChild;
				const padding = placer.offsetTop;
				placer.lastElementChild.style.maxHeight = `calc(100vh - ${padding}px)`;
			}
		} else if (item) {
			this.active = item != this.active ? item : null;
			item.classList.toggle('active', Boolean(this.active));
			if (!this.active) item.blur();
		}
		tosser.classList.toggle('active', Boolean(item));
	}
	toHelper(root) {
		const frag = root.ownerDocument.createDocumentFragment();
		root.children.forEach(item => {
			frag.append(item.cloneNode(true));
		});
		return frag;
	}
}

Page.define('element-menu', HTMLElementMenu);
