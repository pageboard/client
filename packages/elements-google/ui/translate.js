class HTMLElementGoogleTranslate extends HTMLCustomElement {
	setup(state) {
		// delegate to singleton
		this.constructor.setup(state);
	}
	static setup(state) {
		if (this.style) {
			Object.assign(document.body.style, this.style);
		}
		var me = this;
		if (this.observer) return;
		this.observer = new MutationObserver(function(list) {
			list.forEach(function(mut) {
				if (mut.attributeName == "style") {
					var s = mut.target.style;
					var top = parseInt(s.top);
					me.shown = !isNaN(top) && top != 0;
					if (me.shown) me.style = {
						minHeight: s.minHeight,
						top: s.top,
						position: s.position
					};
					else if (top === 0) delete me.style;
					me.setClass();
				}
			});
		});
		this.observer.observe(document.body, {attributes: true});
		this.translate = /\bgoogtrans=/.test(document.cookie);
		if (this.translate) {
			this.show(state);
		}
	}
	static show(state) {
		if (document.body.isContentEditable) return;
		if (!this.id) {
			this.id = `id${Date.now()}`;
			var cb = `HTMLElementGoogleTranslate_${this.id}`;
			window[cb] = this.cb.bind(this, state);
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
	static setClass() {
		document.documentElement.classList.toggle('google-translate-shown', !!this.shown);
	}
	static cb(state) {
		var TE = window.google.translate.TranslateElement;
		this.inst = new TE({
			pageLanguage: document.documentElement.lang,
			layout: TE.InlineLayout.SIMPLE,
			autoDisplay: true
		});
		this.inst.showBanner();

		if (this.links) return;

		var node = this.script;
		var links = [];
		while ((node = node.nextElementSibling)) {
			if (node.href && /(https?:)?\/\/translate\.google.*\.com\//.test(node.href)) {
				links.push(node);
			}
		}
		this.links = links;
		setTimeout(function() {
			var teSel = 'body > .skiptranslate, body > .goog-te-spinner-pos';
			Array.from(document.querySelectorAll(teSel)).forEach(function(node) {
				node.dataset.transitionKeep = true;
			});
		}, 100);
	}
	close() {
		this.constructor.close(); // delegate to singleton
	}
	static close() {

	}
	handleClick(e, state) {
		e.stopPropagation();
		e.preventDefault();
		if (this.constructor.show(state)) {
			window.scrollTo({top: 0});
		}
	}
}

Page.init(function(state) {
	var mergeHead = state.mergeHead;
	var me = HTMLElementGoogleTranslate;
	state.mergeHead = function(head) {
		me.setClass();
		if (me.links) me.links.forEach(function(node) {
			head.appendChild(node.cloneNode(true));
		});
		return mergeHead.call(state, head);
	};
	state.mergeHead.HTMLElementGoogleTranslate = true;
});

Page.setup(function() {
	HTMLCustomElement.define('element-google-translate', HTMLElementGoogleTranslate);
});

