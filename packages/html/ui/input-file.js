class HTMLElementInputFile extends HTMLInputElement {
	#xhr;
	#promise;
	#value;

	constructor() {
		super();
		if (this.init) this.init();
		this.save();
	}

	get value() {
		return this.getAttribute('value');
	}
	save() {
		this.#value = this.value;
	}
	reset() {
		if (this.#value != null) this.setAttribute('value', this.#value);
		else this.removeAttribute('value');
		this.value = this.#value;
	}
	set value(str) {
		if (str != null) {
			this.setAttribute('filename', str.split(/\/|\\/).pop());
		} else {
			this.removeAttribute('filename');
			super.value = "";
		}
	}
	captureClick(e, state) {
		if (super.value) {
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
		if (this.#promise) return this.#promise;
		if (!this.files.length) return Promise.resolve();
		const field = this.closest('.field');
		field.classList.remove('success', 'error');
		const label = field.querySelector('.label');
		function track(num) {
			label.innerText = num;
		}
		track(0);
		field.classList.add('loading');
		const p = new Promise((resolve, reject) => {
			const fail = (err) => {
				field.classList.add('error');
				field.classList.remove('loading');
				this.#xhr = null;
				reject(err);
				this.#promise = null;
			};
			const pass = (obj) => {
				if (!obj.items || obj.items.length == 0) return fail(new Error("File rejected"));
				const val = obj.items[0];
				this.setAttribute('value', val);
				field.classList.add('success');
				field.classList.remove('loading');
				this.#xhr = null;
				resolve();
				this.#promise = null;
			};
			if (this.files.length == 0) return resolve(); // or reject ?

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
		});
		this.#promise = p;
		return p;
	}
}

VirtualHTMLElement.define('element-input-file', HTMLElementInputFile, 'input');

