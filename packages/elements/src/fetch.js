var pendings = {};

module.exports = function(method, url, data) {
	method = method.toLowerCase();
	var fetchOpts = {
		method: method,
		headers: {
			'Accept': 'application/json'
		},
		credentials: "same-origin"
	};
	if (method == "get" || method == "delete") {
		url = Page.format(Object.assign(Page.parse(url), {query: data}));
		var pending = pendings[url];
		if (pending) {
			return pending;
		}
	} else {
		fetchOpts.headers['Content-Type'] = 'application/json';
		fetchOpts.body = JSON.stringify(data);
	}

	var p = fetch(url, fetchOpts).then(function(res) {
		if (res.status >= 400) {
			return res.text().then(function(text) {
				var err = new Error(res.statusText);
				err.status = res.status;
				err.body = text;
				throw err;
			});
		}
		if (res.status == 204) return null;
		return res.json();
	});
	if (method == "get") {
		pendings[url] = p;
		p.catch(function(err) {
			delete pendings[url];
			throw err;
		}).then(function(r) {
			delete pendings[url];
			return r;
		});
	}
	return p;
};
