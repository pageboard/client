class HTMLElementInputFile extends VirtualHTMLElement {
	#xhr
	#promise
	captureClick(e, state) {
		const input = this.querySelector('input[type="text"]');
		if (!input) return;
		if (input.value) {
			e.preventDefault();
			if (this.#xhr) {
				this.#xhr.abort();
				this.#xhr = null;
			}
			input.value = '';
			const file = this.querySelector('input[type="file"]');
			file.reset();
			this.closest('.field').classList.remove('filled', 'loading', 'error', 'success');
		} else {
			// ok
		}
	}

	handleChange(e, state) {
		const input = this.querySelector('input[type="text"]');
		if (!input) return;
		if (e.target.type == "file" && e.target.value) {
			input.value = (e.target.value || "").split(/\/|\\/).pop();
		}
		if (this.dataset.now != null) this.upload();
	}

	upload() {
		if (this.#promise) return this.#promise;
		const file = this.querySelector('input[type="file"]');
		const input = this.querySelector('input[type="text"]');
		if (!input || !file) throw new Error("Unitialized input-file");
		if (!file.files.length) return Promise.resolve();

		const field = this.closest('.field');
		field.classList.remove('success', 'error');
		const label = this.querySelector('.label');
		function track(num) {
			label.innerText = num;
		}
		track(0);
		field.classList.add('loading');
		const p = new Promise((resolve, reject) => {
			const me = this;
			function fail(err) {
				field.classList.add('error');
				field.classList.remove('loading');
				me.#xhr = null;
				reject(err);
				me.#promise = null;
			}
			function pass(obj) {
				if (!obj.items || obj.items.length == 0) return fail(new Error("File rejected"));
				const val = obj.items[0];
				input.value = val;
				field.classList.add('success');
				field.classList.remove('loading');
				me.#xhr = null;
				resolve();
				me.#promise = null;
			}
			if (file.files.length == 0) return resolve(); // or reject ?

			const fd = new FormData();
			for (let i = 0; i < file.files.length; i++) {
				fd.append("files", file.files[i]);
			}

			const xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", function (e) {
				if (e.lengthComputable) {
					let percent = Math.round((e.loaded * 100) / e.total);
					if (percent >= 100) percent = 99; // only load event can reach 100
					track(percent);
				}
			});

			xhr.addEventListener('load', function () {
				track(100);
				try {
					pass(JSON.parse(xhr.responseText));
				} catch (ex) {
					fail(ex);
				}
			});

			xhr.addEventListener('error', function (e) {
				if (xhr.status == 0) return fail("Connection error");
				const msg = xhr.statusText || "Connection error";
				const err = new Error(msg);
				err.statusCode = xhr.status;
				fail(err);
			});
			try {
				xhr.open("POST", `/.api/upload/${file.id}`, true);
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

Page.setup(function () {
	VirtualHTMLElement.define('element-input-file', HTMLElementInputFile);
});
