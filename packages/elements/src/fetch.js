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
		var type = res.headers.get('Content-Type') || "";
		if (res.status == 204 || !type.startsWith('application/json')) {
			return res.text().then(function(text) {
				if (res.status >= 400) {
					var err = new Error(res.statusText);
					err.status = res.status;
					err.body = text;
					throw err;
				} else {
					return {
						status: res.status,
						statusText: res.statusText,
						body: text
					};
				}
			});
		} else {
			return res.json().then(function(obj) {
				obj.status = res.status;
				obj.statusText = res.statusText;
				obj.lock = (res.headers.get('X-Upcache-Lock') || "").split(', ').shift() || null;
				obj.granted = res.headers.get('X-Granted') ? true : false;
				return obj;
			});
		}
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
