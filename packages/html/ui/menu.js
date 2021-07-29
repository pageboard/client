Page.patch(function(state) {
	function isSameOrParent(loc, state) {
		if (!Page.sameDomain(loc, state)) {
			return false;
		} else if (Page.samePathname(loc, state)) {
			if (Page.sameQuery(loc, {query:{}})) return true;
			loc.query.develop = state.query.develop;
			if (Page.sameQuery(loc, state)) return true;
		} else {
			return state.pathname.startsWith(loc.pathname + '/');
		}
	}
	state.finish(function() {
		document.querySelectorAll('[block-type="menu"] [href]').forEach((item) => {
			const loc = item.getAttribute('href');
			if (!loc) return;
			if (isSameOrParent(Page.parse(loc), state)) {
				item.classList.add('active');
			}
		});
	});
});

class HTMLElementMenu extends VirtualHTMLElement {
	setup(state) {
		if (this.isContentEditable || this.matches('.vertical')) return;
		const menu = this.firstElementChild;
		const helper = this.lastElementChild;
		helper.lastElementChild.lastElementChild.appendChild(this.toHelper(menu));
		this.observer = new ResizeObserver((entries, observer) => {
			window.requestAnimationFrame(() => {
				const styles = window.getComputedStyle(this);
				const parentWidth = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight) + this.offsetWidth;
				const menuWidth = menu.offsetWidth;
				this.classList.toggle('burger', parentWidth <= menuWidth);
			});
		});
		this.observer.observe(this.parentNode);
	}
	close(state) {
		if (this.observer) this.observer.disconnect();
	}
	handleAllClick(e, state) {
		if (this.active) {
			this.active.classList.toggle('active', false);
		}
		const tosser = this.lastElementChild;
		tosser.classList.remove('inactive');
		let item = tosser.contains(e.target) && !e.target.closest('a') && e.target.closest('.item');
		if (item == tosser) {
			if (tosser.classList.contains('active')) {
				this.active = item = null;
				tosser.classList.add('inactive');
				tosser.blur();
			} else {
				const padding = this.offsetTop + this.offsetHeight;
				const menu = tosser.lastElementChild.lastElementChild;
				menu.style.maxHeight = `calc(100% - ${padding}px)`;
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
		root.children.forEach((item) => {
			frag.append(item.cloneNode(true));
		});
		return frag;
	}
}

Page.setup(function() {
	VirtualHTMLElement.define('element-menu', HTMLElementMenu);
});
