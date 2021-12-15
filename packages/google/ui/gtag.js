window.dataLayer = window.dataLayer || [];

// debug using https://tagassistant.google.com/
class HTMLElementGTMScript extends HTMLScriptElement {
	#type
	#id
	#started
	constructor() {
		super();
		if (this.init) this.init();
	}
	init() {
		const loc = Page.parse(this.src);
		this.#type = loc.pathname.startsWith('/gtm') ? 'gtm' : 'gtag';
		if (this.#type == "gtag") {
			window.gtag = window.gtag || function gtag() {
				window.dataLayer.push(arguments);
			};
		}
		this.#id = loc.query.id;
	}
	consent(state) {
		if (!this.#id) return;
		const agreed = state.scope.$consent == "yes";
		window['ga-disable-' + this.#id] = !agreed;
		if (this.#type == "gtm") this.#gtm(agreed, state);
		else if (this.#type == "gtag") this.#gtag(agreed, state);
	}
	#gtm(agreed, state) {
		if (!agreed) {
			Page.storage.clearCookies(/^_g/);
		} else if (!this.#started) {
			this.#started = true;
			this.#push({
				'gtm.start': new Date().getTime(),
				event: 'gtm.js',
				anonymize_ip: true
			});
		}
	}
	#gtag(agreed, state) {
		const val = agreed ? 'granted' : 'denied';
		const opts = {
			ad_storage: val,
			analytics_storage: val
		};
		if (!this.#started) {
			this.#started = true;
			this.#push(['consent', 'default', opts]);
			this.#push(['js', new Date()]);
		} else {
			this.#push(['consent', 'update', opts]);
		}
		this.#push(['config', this.#id, {
			page_path: state.toString()
		}]);
	}
	#push(args) {
		if (this.#type == "gtm") {
			window.dataLayer.push(args);
		} else {
			window.gtag.apply(null, args);
		}
	}
	paint(state) {
		if (this.#id) state.consent(this);
	}
}
Page.setup(
	() => VirtualHTMLElement.define('element-gtm-script', HTMLElementGTMScript, "script")
);
