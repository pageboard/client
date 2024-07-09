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
	const langs = [];
	const { languages = [] } = window.navigator;
	for (const lang of languages ?? []) {
		langs.push(lang);
		const parts = lang.split('-');
		if (parts.length > 1 && !languages.includes(parts[0])) {
			langs.push(parts[0]);
		}
	}
	if (langs.length) fetchOpts.headers['Accept-Language'] = langs.join(',');

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

	const p = fetch(url, fetchOpts).then(res => {
		// FIXME either throw or return an object but do not do both
		// if an error returns an object, it should not be in obj.item,
		// since templates expect obj.item to be populated
		const type = res.headers.get('Content-Type') || "";
		if (res.status == 204 || !type.startsWith('application/json')) {
			return res.text().then(text => {
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
			return res.json().then(obj => {
				if (obj.item?.type == "error") {
					obj.statusText = obj.item.data?.message ?? "";
					delete obj.item;
				}
				obj.status = res.status;
				obj.statusText ??= res.statusText;
				const h = res.headers;
				obj.locks = (h.get('X-Upcache-Lock') ?? "").split(',').map(str => str.trim()).filter(str => Boolean(str.length));
				obj.granted = h.get('X-Pageboard-Granted') ? true : false;
				obj.grants = h.get('X-Pageboard-Grants')?.split(',') ?? [];
				obj.types = h.get('X-Pageboard-Elements')?.split(',') ?? [];
				obj.lang = h.get('Content-Language') ?? "";
				return obj;
			});
		}
	});
	if (method == "get") {
		pendings[url] = p;
		p.catch(err => {
			delete pendings[url];
			throw err;
		}).then(r => {
			delete pendings[url];
			return r;
		});
	}
	return p;
}
