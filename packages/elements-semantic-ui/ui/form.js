Page.setup(function(state) {
	document.body.addEventListener('submit', formHandler, false);

	// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
	function formHandler(e) {
		e.preventDefault();
		var form = e.target.closest('form');
		if (!form) return;
		form.classList.remove('error', 'success');
		// 1. get data and submit json to "action"
		fetch(form.action, {
			method: form.method,
			body: new FormData(form)
		}).then(function(res) {
			var block = res.json();
			if (form.dataset.url) return afterHandler(block, Object.assign({}, form.dataset));
		}).then(function() {
			form.classList.add('success');
		}).catch(function(err) {
			console.error(err);
			form.classList.add('error');
		});
	}

	function afterHandler(block, params) {
		// we obviously need some way to build new data, we can't just send block.id
		// sometimes we need some other data that has been written as form param ?
		var url = params.url;
		delete params.url;
		return fetch(url, {
			method: 'post',
			body: {
				result: block,
				params: params
			}
		});
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
