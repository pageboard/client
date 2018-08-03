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
			return Pageboard.script(Page.format({
				pathname: "/.api/elements.js",
				query: {
					type: page.type,
					v: page.site.version || undefined
				}
			})).then(function() {
				return page;
			});
		}).catch(function(err) {
			// emergency error handling
			// TODO fix err.code here
			// TODO return {type: 'error', data: err} ?
			var doc = document;
			doc.body.textContent = '[err.code] [err]';
			doc.title = err.code;
			doc.head.prepend(doc.dom('<meta http-equiv="Status" content="[err.code] [err]">'));
			doc.documentElement.fuse(err);
			throw err;
		});
	}).then(function(page) {
		if (!page.data) page.data = {};
		var scope = {
			$query: state.query,
			$pathname: state.pathname,
			$hrefs: page.hrefs || {},
			$links: page.links || {},
			$site: page.site,
			$page: page.data
		};
		delete page.hrefs;
		delete page.site;
		delete page.links;
		Object.keys(Pageboard.elements).forEach(function(name) {
			var el = Pageboard.elements[name];
			if (!el.render && el.html) el.render = function(doc, block) {
				var dom = doc.dom(el.html);
				if (dom && dom.nodeName == 'HTML') {
					Pageboard.view.doc.replaceChild(dom, doc.documentElement);
				}
				var rscope = Object.assign({}, scope, {
					$schema: el.properties,
					$id: block.id
				});
				if (el.fuse) dom = el.fuse.call(el, dom, block.data, rscope) || dom;
				else if (Pageboard.fusable(el.html)) dom = dom.fuse(block.data, rscope, el.filters);
				return dom;
			};
		});

		Pageboard.view = new Pagecut.Viewer({
			elements: Pageboard.elements
		});

		return Pageboard.view.from(page).then(function(node) {
			if (!node || node.nodeName != "HTML") {
				throw new Error("page render should return an html element");
			}
			var doc = node.ownerDocument;

			if (window.parent.Pageboard && window.parent.Pageboard.write) {
				// FIXME find a better way for write element to insert js/css before page is handed to Page
				scope.$write = true;
				window.parent.Pageboard.install(doc, page);
			}
			return Promise.all(Pageboard.view.elements.map(function(el) {
				if (el.group == "page" && el.name != page.type) return;
				if (el.install) return el.install.call(el, doc, page, scope);
			})).then(function() {
				var pageEl = Pageboard.elements[page.type];
				Pageboard.view.elements.forEach(function(el) {
					if (el.group == "page") return;
					if (el.scripts) Array.prototype.push.apply(this.scripts, el.scripts);
					if (el.stylesheets) Array.prototype.push.apply(this.stylesheets, el.stylesheets);
				}, pageEl);
				doc.head.appendChild(
					doc.dom(
						'<link rel="stylesheet" href="[stylesheets|repeat]" />',
						'<script defer src="[scripts|repeat]"></script>'
					).fuse(pageEl)
				);
				state.document = doc;
			});
		});
	});
});
