Page.setup(function(state) {
	document.body.addEventListener('submit', function(e) {
		var form = e.target;
		if (!form.matches('[block-type="login"]')) return;
		e.preventDefault();
		fetch(form.action, {
			method: form.method || 'post',
			body: new FormData(form)
		}).then(function(res) {
			if (res.status >= 200 && res.status < 300) {
				var data = res.json();
				// success
			} else {
				// failure
			}
		});
	});
});
