Page.route(function(state) {
	return Promise.resolve().then(function() {
		return fetch(Page.format({
			pathname: '/.api/page',
			query: {
				url: state.pathname,
				develop: state.query.develop
			}
		}), {
			credentials: "same-origin",
			headers: {
				'Accept': 'application/json'
			}
		}).then(function(res) {
			if (res.status >= 400) {
				var err = new Error(res.statusText);
				err.code = res.status;
				throw err;
			}
			return res.json();
		}).then(function(page) {
			var node = document.createElement('script');
			node.src = Page.format({
				pathname: "/.api/elements.js",
				query: {
					type: page.type,
					v: page.site.version || undefined
				}
			});
			return new Promise(function(resolve, reject) {
				node.addEventListener('load', function() {
					node.remove();
					resolve(page);
				});
				node.addEventListener('error', function() {
					node.remove();
					var err = new Error(`Cannot load ${node.getAttribute('src')}`);
					err.code = 404;
					reject(err);
				});
				document.head.appendChild(node);
			});
		}).catch(function(err) {
			// emergency error handling
			// TODO fix err.code here
			document.body.textContent = `${err.code} ${err}`;
			document.title = err.code;
			document.head.insertAdjacentHTML('afterBegin', `<meta http-equiv="Status" content="${err.code} ${err}">`);
			throw err;
		});
	}).then(function(page) {
		if (!page.data) page.data = {};
		Pageboard.view = new Pagecut.Viewer({
			elements: Pageboard.elements
		});
		Pageboard.hrefs = page.hrefs || {};
		Pageboard.site = page.site;
		delete page.hrefs;
		delete page.site;
		return Pageboard.view.from(page).then(function(body) {
			if (body.nodeName != "BODY") {
				throw new Error("Element page.render did not return a body node");
			}
			var doc = body.ownerDocument;
			if (body.parentNode != doc.documentElement) {
				console.warn("route needs to replace body");
				doc.documentElement.replaceChild(body, doc.body);
			}

			if (window.parent.Pageboard && window.parent.Pageboard.write) {
				// FIXME find a better way for write element to insert js/css before page is handed to Page
				Pageboard.write = true;
				window.parent.Pageboard.install(doc, page);
			}
			return Promise.all(Pageboard.view.elements.map(function(el) {
				if (el.group == "page" && el.name != page.type) return;
				if (el.install) return el.install.call(el, doc, page, Pageboard.view);
			})).then(function() {
				var pageEl = Pageboard.elements[page.type];
				Pageboard.view.elements.forEach(function(el) {
					if (el.group == "page") return;
					if (el.scripts) Array.prototype.push.apply(this.scripts, el.scripts);
					if (el.stylesheets) Array.prototype.push.apply(this.stylesheets, el.stylesheets);
				}, pageEl);
				doc.head.insertAdjacentHTML('beforeEnd', "\n" +
					pageEl.stylesheets.map(function(href) {
						return `<link rel="stylesheet" href="${href}" />`;
					}).join("\n")
				);
				doc.head.insertAdjacentHTML('beforeEnd', "\n" +
					pageEl.scripts.map(function(src) {
						return `<script src="${src}"></script>`;
					}).join("\n")
				);
				state.document = doc;
			});
		});
	});
});
