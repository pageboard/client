class HTMLElementInputFile extends HTMLInputElement {
	#xhr;
	#defer;
	#defaultValue;

	/* Since input[type=file] does not allow setting "value" property,
	 * it is stored in the "value" attribute,
	 * forcing defaultValue to be handled with a private field.
	 * The "filename" attribute is used to display both selected value property,
	 * and filled value attribute.
	 */

	constructor() {
		super();
		if (this.init) this.init();
		this.save();
	}
	get defaultValue() {
		return this.#defaultValue;
	}
	set defaultValue(str) {
		this.#defaultValue = str;
	}
	get value() {
		return this.getAttribute('value');
	}
	set value(str) {
		if (str) {
			this.setAttribute('value', str);
		} else {
			this.removeAttribute('value');
			super.value = "";
		}
	}
	captureClick(e, state) {
		if (this.value) {
			e.preventDefault();
			if (this.#xhr) {
				this.#xhr.abort();
				this.#xhr = null;
			}
			this.value = null;
			this.closest('.field').classList.remove('loading', 'error', 'success');
		} else {
			// ok
		}
	}

	handleChange(e, state) {
		if (super.value) {
			this.value = super.value;
		} else {
			this.value = null;
		}
	}

	presubmit() {
		if (this.#defer) return this.#defer;
		if (!this.files.length) return Promise.resolve();
		const field = this.closest('.field');
		field.classList.remove('success', 'error');
		const label = field.querySelector('.label');
		function track(num) {
			label.innerText = num;
		}
		track(0);
		field.classList.add('loading');
		this.#defer = new Deferred();

		const fail = (err) => {
			field.classList.add('error');
			field.classList.remove('loading');
			this.#xhr = null;
			this.#defer.reject(err);
			this.#defer = null;
		};
		const pass = (obj) => {
			if (!obj.items || obj.items.length == 0) return fail(new Error("File rejected"));
			const val = obj.items[0];
			this.value = val;
			field.classList.add('success');
			field.classList.remove('loading');
			this.#xhr = null;
			this.#defer.resolve();
			this.#defer = null;
		};
		if (this.files.length == 0) return this.#defer.resolve(); // or reject ?

		const fd = new FormData();
		fd.append("files", this.files[0]);

		const xhr = new XMLHttpRequest();

		xhr.upload.addEventListener("progress", (e) => {
			if (e.lengthComputable) {
				let percent = Math.round((e.loaded * 100) / e.total);
				if (percent >= 100) percent = 99; // only load event can reach 100
				track(percent);
			}
		});

		xhr.addEventListener('load', () => {
			track(100);
			try {
				pass(JSON.parse(xhr.responseText));
			} catch (ex) {
				fail(ex);
			}
		});

		xhr.addEventListener('error', (e) => {
			if (xhr.status == 0) return fail("Connection error");
			const msg = xhr.statusText || "Connection error";
			const err = new Error(msg);
			err.statusCode = xhr.status;
			fail(err);
		});
		try {
			xhr.open("POST", `/.api/upload/${this.id}`, true);
			xhr.setRequestHeader('Accept', "application/json; q=1.0");
			xhr.send(fd);
			this.#xhr = xhr;
		} catch (err) {
			fail(err);
		}
		return this.#defer;
	}
}

VirtualHTMLElement.define('element-input-file', HTMLElementInputFile, 'input');

