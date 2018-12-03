class HTMLInputMap extends HTMLCustomElement {
	init() {
		this.style.display = "block";
		this._changed = Pageboard.debounce(this._changed.bind(this), 50);
		this._focused = this._focused.bind(this);
	}
	connectedCallback() {
		if (this._proxy) return;
		this._proxy = this.appendChild(
			this.dom(`<input name="${this.getAttribute('name')}" type="hidden" />`)
		);
		this._observer = new MutationObserver(function(mutations) {
			this._render();
		}.bind(this));
		this._observer.observe(this._proxy, {
			attributes: true
		});
		this._table = this.appendChild(this.dom(`<table class="ui very compact celled small striped table">
			<tbody></tbody>
		</table>`));
		this._table.addEventListener('change', this._changed, false);
		this._table.addEventListener('input', this._focused, false);
		this._table.addEventListener('focus', this._focused, true);
		this._render();
	}
	disconnectedCallback() {
		if (this._observer) {
			this._observer.disconnect();
			delete this._observer;
		}
		delete this._proxy;
		this._table.removeEventListener('input', this._focused, false);
		this._table.removeEventListener('focus', this._focused, true);
		this._table.removeEventListener('change', this._changed, false);
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
		var name = this.getAttribute('name');
		Object.keys(obj).concat([""]).forEach(function(key, i) {
			var val = obj[key];
			if (val === undefined || val === null) val = '';
			if (!Array.isArray(val)) val = [val];
			val.forEach(function(val, j) {
				body.appendChild(this.dom(`<tr>
					<td><input class="ui input" name="$key-${name}.${i}-${j}" value="${key}" /></td>
					<td><input class="ui input" name="$val-${name}.${i}-${j}" value="${val}" /></td>
				</tr>`));
			}, this);
		}, this);
		this._restoreSel();
	}
	_focused(e) {
		if (e.target.matches('input')) {
			this._saveSel(e.target);
		}
	}
	_saveSel(node) {
		this._selection = {
			name: node.name,
			start: node.selectionStart,
			end: node.selectionEnd,
			dir: node.selectionDirection
		};
	}
	_restoreSel() {
		var sel = this._selection;
		if (!sel) return;
		var node = this._table.querySelector(`[name="${sel.name}"]`);
		if (!node) return;
		node.focus();
		if (node.setSelectionRange) node.setSelectionRange(sel.start, sel.end, sel.dir);
	}
	_changed(e) {
		var obj = {};
		var removals = [];

		Array.from(this._table.querySelector('tbody').children).forEach(function(tr) {
			var key = tr.children[0].firstChild.value;
			var val = obj[key];
			var inputVal = tr.children[1].firstChild.value;
			if (key) {
				if (val != null) {
					if (!Array.isArray(val)) {
						obj[key] = val = [val];
					}
					val.push(inputVal);
				} else {
					obj[key] = inputVal;
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

