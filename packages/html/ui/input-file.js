class HTMLElementInputFile extends HTMLCustomElement {
	captureClick(e, state) {
		var input = this.querySelector('input[type="text"]');
		if (!input) return;
		if (input.value) {
			e.preventDefault();
			if (this._xhr) {
				this._xhr.abort();
				delete this._xhr;
			}
			input.setAttribute('value', '');
			input.value = '';
			var file = this.querySelector('input[type="file"]');
			file.reset();
			this.closest('.field').classList.remove('filled', 'loading', 'error', 'success');
		} else {
			// ok
		}
	}

	handleChange(e, state) {
		var input = this.querySelector('input[type="text"]');
		if (!input) return;
		if (e.target.type == "file" && e.target.value) {
			input.value = (e.target.value || "").split(/\/|\\/).pop();
		}
		input.setAttribute('value', input.value);
		if (this.dataset.now != null) this.upload();
	}

	upload() {
		if (this._promise) return this._promise;
		var file = this.querySelector('input[type="file"]');
		var input = this.querySelector('input[type="text"]');
		if (!input || !file) throw new Error("Unitialized input-file");
		if (!file.files.length) return Promise.resolve();
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
				if (!obj.items || obj.items.length == 0) return fail(new Error("File rejected"));
				var val = obj.items[0];
				input.value = val;
				input.setAttribute('value', val);
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
			var url = "/.api/upload";
			var id = this.parentNode && this.parentNode.getAttribute('block-id');
			if (id) url += `/${id}`;
			try {
				xhr.open("POST", url, true);
				xhr.setRequestHeader('Accept', "application/json; q=1.0");
				xhr.send(fd);
				self._xhr = xhr;
			} catch(err) {
				fail(err);
			}
		}.bind(this));
		this._promise = p;
		return p;
	}
}

Page.setup(function() {
	HTMLCustomElement.define('element-input-file', HTMLElementInputFile);
});
