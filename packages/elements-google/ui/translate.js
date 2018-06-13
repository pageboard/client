class HTMLElementGoogleTranslate extends HTMLCustomElement {
	static init() {
		var me = this;
		this.observer = new MutationObserver(function(list) {
			list.forEach(function(mut) {
				if (mut.attributeName == "style") {
					var top = parseInt(mut.target.style.top);
					me.shown = !isNaN(top) && top != 0;
					me.update();
				}
			});
		});
		this.observer.observe(document.body, {attributes: true});
		this.translate = (new RegExp('\\bgoogtrans=')).test(document.cookie);
		if (this.translate) {
			this.show();
		}
	}
	static show() {
		if (document.body.isContentEditable) return;
		if (!this.id) {
			this.id = `id${Date.now()}`;
			var cb = `HTMLElementGoogleTranslate_${this.id}`;
			window[cb] = this.setup.bind(this);
			var script = document.createElement('script');
			script.src = `https://translate.google.com/translate_a/element.js?cb=${cb}`;
			this.script = script;
			document.head.appendChild(script);
			return true;
		} else if (this.inst) {
			if (this.shown) return false;
			this.inst.showBanner();
			return true;
		}
		return false;
	}
	static update() {
		console.log("update", this.shown);
		document.documentElement.classList.toggle('google-translate-shown', this.shown);
	}
	static setup() {
		var TE = google.translate.TranslateElement;
		this.inst = new TE({
			pageLanguage: document.documentElement.lang,
			layout: TE.InlineLayout.SIMPLE,
			autoDisplay: true
		});
		this.inst.showBanner();

		if (this.patched) return;
		this.patched = true;

		var node = this.script;
		var styles = [];
		while (node=node.nextElementSibling) {
			if (node.href && /(https?:)?\/\/translate\.google.*\.com\//.test(node.href)) {
				styles.push(node);
			}
		}
		var updateHead = Page.updateHead;
		var me = this;
		Page.updateHead = function(head) {
			me.update();
			styles.forEach(function(node) {
				head.appendChild(node.cloneNode(true));
			});
			return updateHead.call(Page, head);
		};
	}
	static destroy() {
		Array.prototype.forEach.call(document.body.children, function(node) {
			if (node.matches('.skiptranslate,.goog-te-spinner-pos')) {
				node.dataset.transitionKeep = true;
			}
		});
		this.observer.disconnect();
	}
	connectedCallback() {
		this.addEventListener('click', this.clickHandler, false);
	}
	disconnectedCallback() {
		this.removeEventListener('click', this.clickHandler, false);
	}
	clickHandler(e) {
		e.stopPropagation();
		e.preventDefault();
		if (HTMLElementGoogleTranslate.show()) {
			window.scrollTo({top: 0});
		}
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-google-translate', HTMLElementGoogleTranslate);
});

Page.close(function() {
	HTMLElementGoogleTranslate.destroy();
});

