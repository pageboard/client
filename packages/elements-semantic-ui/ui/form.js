Page.setup(function(state) {
	document.body.addEventListener('submit', formHandler, false);
	document.body.addEventListener('input', inputHandler, false);

	var toInput;
	function inputHandler(e) {
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		if (form.dataset.auto != "true") return;
		if (toInput) clearTimeout(toInput);
		toInput = setTimeout(function() {
			toInput = null;
			formHandler(e);
		}, 300);
	}

	// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
	function formHandler(e) {
		var form = e.target.matches('form') ? e.target : e.target.form;
		if (!form) return;
		e.preventDefault();
		if (form.matches('.loading')) return;
		form.classList.remove('error', 'success');
		form.classList.add('loading');
		var formData = new FormData(form);
		var query = formDataToQuery(formData);
		var p;
		if (form.method.toLowerCase() == "get") {
			p = Page.push({pathname: form.action, query: query});
		} else p = fetchAction(form.method, form.action, query).then(function(data) {
			if (form.dataset.redirect) {
				document.location = form.dataset.redirect;
			}
			form.classList.add('success');
		});
		p.catch(function(err) {
			console.error(err);
			form.classList.add('error');
		}).then(function() {
			form.classList.remove('loading');
		});
	}

	function fetchAction(method, url, data) {
		var fetchOpts = {
			method: method,
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			}
		};
		if (/^get$/i.test(method)) {
			url = Page.format(Object.assign(Page.parse(url), {query: data}));
		} else {
			fetchOpts.body = JSON.stringify(data);
		}

		// 1. get data and submit json to "action"
		return fetch(url, fetchOpts).then(function(res) {
			return res.json();
		});
	}

	function formDataToQuery(formData) {
		var query = {};
		formData.forEach(function(val, key) {
			var old = query[key];
			if (old !== undefined) {
				if (!Array.isArray(old)) {
					query[key] = [old];
				}
				query[key].push(val);
			} else {
				query[key] = val;
			}
		});
		return query;
	}

	// https://daverupert.com/2017/11/happier-html5-forms/
	document.body.addEventListener('blur', blurHandler, true);
	document.body.addEventListener('focus', focusHandler, true);
	document.body.addEventListener('invalid', invalidHandler, true);

	function updateClass(field, validity, remove) {
		for (var key in validity) {
			if (key == "valid") continue;
			var has = validity[key];
			field.classList.toggle(key, !remove && has);
		}
		field.classList.toggle('error', !validity.valid);
	}
	function invalidHandler(e) {
		// e.preventDefault(); // disable when we have proper messages
		blurHandler(e, true);
	}
	function blurHandler(e, checked) {
		var el = e.target;
		if (!e.target.matches('input,textarea,select')) return;
		if (!checked) el.checkValidity();
		updateClass(el.closest('.field') || el, el.validity);
	}
	function focusHandler(e) {
		var el = e.target;
		if (!el.matches('input,textarea,select')) return;
		updateClass(el.closest('.field') || el, el.validity, true);
	}
});
