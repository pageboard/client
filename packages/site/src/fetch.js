const pendings = {};

export default function(method, url, data) {
	method = method.toLowerCase();
	const fetchOpts = {
		method: method,
		headers: {
			'Accept': 'application/json'
		},
		credentials: "same-origin"
	};
	if (method == "get" || method == "delete") {
		url = Object.assign(Page.parse(url), {query: data}).toString();
		const pending = pendings[url];
		if (pending) {
			return pending;
		}
	} else {
		fetchOpts.headers['Content-Type'] = 'application/json';
		fetchOpts.body = JSON.stringify(data);
	}

	const p = fetch(url, fetchOpts).then((res) => {
		const type = res.headers.get('Content-Type') || "";
		if (res.status == 204 || !type.startsWith('application/json')) {
			return res.text().then((text) => {
				if (res.status >= 400) {
					const err = new Error(res.statusText);
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
			return res.json().then((obj) => {
				obj.status = res.status;
				let text;
				if (obj.item?.type == "error") {
					text = obj.item.data?.message ?? "";
				}
				obj.statusText = text || res.statusText;
				obj.locked = (res.headers.get('X-Upcache-Lock') || "").split(', ').shift() || null;
				obj.granted = res.headers.get('X-Granted') ? true : false;
				return obj;
			});
		}
	});
	if (method == "get") {
		pendings[url] = p;
		p.catch((err) => {
			delete pendings[url];
			throw err;
		}).then((r) => {
			delete pendings[url];
			return r;
		});
	}
	return p;
}
