class HTMLInputMap extends HTMLCustomElement {
	init() {
		this.style.display = "block";
		this._parse = this._parse.bind(this);
		this._focus = this._focus.bind(this);
	}
	connectedCallback() {
		if (this._proxy) return;
		this._proxy = this.appendChild(
			this.dom`<input name="${this.getAttribute('name')}" type="hidden" />`
		);
		this._observer = new MutationObserver(function(mutations) {
			this._render();
		}.bind(this));
		this._observer.observe(this._proxy, {
			attributes: true
		});
		this._table = this.appendChild(this.dom`<table class="ui very compact celled small striped table">
			<tbody></tbody>
		</table>`);
		this._table.addEventListener('change', this._parse, false);
		this._table.addEventListener('focus', this._focus, true);
		this._render();
	}
	disconnectedCallback() {
		if (this._observer) {
			this._observer.disconnect();
			delete this._observer;
		}
		delete this._proxy;
		this._table.removeEventListener('focus', this._focus, true);
		this._table.removeEventListener('input', this._parse, false);
	}
	_render() {
		var obj = {};
		if (this._proxy.value) try {
			obj = JSON.parse(this._proxy.value);
		} catch(ex) {
			console.error(ex);
		}
		var body = this._table.querySelector('tbody');
		body.textContent = '';
		var focused = false;
		Object.keys(obj).concat([""]).forEach(function(key) {
			var row = body.appendChild(this.dom`<tr>
				<td><input class="ui input" value="${key}" /></td>
				<td><input class="ui input" value="${obj[key]}" /></td>
			</tr>`);
			if (this._cur && this._cur.key == key && !focused) {
				row.children[this._cur.index].firstChild.focus();
				focused = true;
			}
		}, this);
	}
	_focus(e) {
		var focus = e.target;
		if (focus.matches('input')) {
			var tr = focus.closest('tr');
			var key = tr.children[0].firstChild.value;
			this._cur = {key: key, index: focus == tr.children[0] ? 0 : 1};
		}
	}
	_parse(e) {
		var obj = {};
		var removals = [];
		var focus = e.target;
		Array.from(this._table.querySelector('tbody').children).forEach(function(tr) {
			var key = tr.children[0].firstChild.value;
			if (key) {
				obj[key] = tr.children[1].firstChild.value;
				if (focus && focus.closest('tr') == tr) {
					this._cur = {key: key, index: focus == tr.children[0] ? 0 : 1};
				}
			} else {
				removals.push(tr);
			}
		}, this);
		removals.forEach(function(node) {
			node.remove();
		});
		this._proxy.value = JSON.stringify(obj);
	}
}
window.customElements.define('input-map', HTMLInputMap);

