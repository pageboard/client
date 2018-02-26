class HTMLElementInputFile extends HTMLCustomElement {
	init() {
		this.change = this.change.bind(this);
		this.click = this.click.bind(this);
	}
	connectedCallback() {
		var file = this.querySelector('input[type="file"]');
		if (!file) return;
		var input = this.querySelector('input[type="text"]');
		if (input) return;

		input = this.ownerDocument.createElement('input');
		input.required = file.required;
		input.disabled = file.disabled;
		input.type = "text";
		input.name = file.name;
		input.value = file.getAttribute("value");
		// from now on submission will be done through form.js
		file.removeAttribute('name');
		input.placeholder = file.placeholder;
		this.insertBefore(input, file);
		file.addEventListener('change', this.change);
		this.addEventListener('click', this.click);
	}

	click(e) {
		if (e.target.closest('.icon.delete')) {
			if (this._xhr) {
				this._xhr.abort();
				delete this._xhr;
			}
			var input = this.querySelector('input[type="text"]');
			input.value = "";
			this.closest('.field').classList.remove('loading', 'error', 'success');
		}
	}

	uploadName(str) {
		return (str || "").split(/\/|\\/).pop();
	}

	change(e) {
		var input = this.querySelector('input[type="text"]');
		if (!input) return;
		if (e.target.value) {
			input.value = this.uploadName(e.target.value);
		}
		if (this.dataset.now != null) this.upload();
	}

	disconnectedCallback() {
		var file = this.querySelector('input[type="file"]');
		if (file) file.removeEventListener('change', this.change);
		this.removeEventListener('click', this.click);
	}

	// TODO use input file to maintain a list of input text(s)
	// and do not try to keep the input text

	upload() {
		if (this._promise) return this._promise;
		var file = this.querySelector('input[type="file"]');
		var input = this.querySelector('input[type="text"]');
		if (!input || !file) throw new Error("Unitialized input-file");
		if (!file.files.length) return Promise.resolve();
		input.value = "";
		var self = this;
		var field = this.closest('.field');
		field.classList.remove('success', 'error');
		field.classList.add('loading');
		var label = this.querySelector('.label');
		var p = new Promise(function(resolve, reject) {
			function track(num) {
				label.innerText = num;
			}
			function fail(err) {
				track(-1);
				console.error(err);
				field.classList.add('error');
				field.classList.remove('loading');
				delete self._xhr;
				reject(err);
				delete self._promise;
			}
			function pass(obj) {
				var val = Page.parse(obj[0]);
				if (Page.sameDomain(val, Page.state)) {
					val = Page.format(val);
				} else {
					val = obj[0];
				}
				input.value = val;
				track(-1);
				field.classList.add('success');
				field.classList.remove('loading');
				delete self._xhr;
				resolve();
				delete self._promise;
			}
			if (file.files.length == 0) return resolve(); // or reject ?
			track(0);
			var fd = new FormData();
			// TODO input multiple can be symbolized by showing multiple
			// .action.input with a close button. Closing means not adding
			// from the list of files. It should also be possible to
			// transparently use again the input file and concat file.files
			for (var i=0; i < file.files.length; i++) {
				fd.append("files", file.files[i]);
			}

			var xhr = new XMLHttpRequest();

			xhr.upload.addEventListener("progress", function(e) {
				if (e.lengthComputable) {
					var percent = Math.round((e.loaded * 100) / e.total);
					if (percent >= 100) percent = 99; // only load event can reach 100
					track(percent);
				}
			});

			xhr.addEventListener('load', function() {
				track(100);
				try {
					pass(JSON.parse(xhr.responseText));
				} catch(ex) {
					fail(ex);
				}
			});

			xhr.addEventListener('error', function(e) {
				if (xhr.status == 0) return fail("Connection error");
				var msg = xhr.statusText || "Connection error";
				var err = new Error(msg);
				err.statusCode = xhr.status;
				fail(err);
			});
			try {
				xhr.open("POST", "/.api/upload", true);
				xhr.setRequestHeader('Accept', "application/json; q=1.0");
				xhr.send(fd);
				self._xhr = xhr;
			} catch(err) {
				fail(err)
			}
		}.bind(this));
		this._promise = p;
		return p;
	}
}

Page.setup(function() {
	window.customElements.define('element-input-file', HTMLElementInputFile);
});
