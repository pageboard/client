class HTMLInputMap extends Page.Element {
	#proxy;
	#observer;
	#table;
	#selection;

	get name() {
		return this.getAttribute('name') || '';
	}
	get value() {
		let obj;
		if (this.#proxy?.value) try {
			obj = JSON.parse(this.#proxy.value);
		} catch(ex) {
			console.error(ex);
		}
		return obj;
	}
	set value(obj) {
		if (!this.#proxy) return;
		const val = JSON.stringify(obj);
		if (this.#proxy.value == val) return;
		this.#proxy.value = val;
		Pageboard.trigger(this.#proxy, 'change');
	}
	connectedCallback() {
		if (this.#proxy) return;
		this.#proxy = this.appendChild(
			this.dom(`<input name="${this.name}" type="hidden" />`)
		);
		const renderer = Page.debounce(() => this.#render(), 10);
		this.#observer = new MutationObserver(mutations => renderer());
		this.#observer.observe(this.#proxy, {
			attributes: true
		});
		this.#table = this.appendChild(this.dom(`<table class="ui very compact celled small striped table">
			<tbody></tbody>
		</table>`));
		this.#table.addEventListener('change', this, false);
		this.#table.addEventListener('input', this, false);
		this.#table.addEventListener('focus', this, true);
		this.#render();
	}
	disconnectedCallback() {
		if (this.#observer) {
			this.#observer.disconnect();
			this.#observer = null;
		}
		this.#proxy = null;
		this.#table.removeEventListener('focus', this, true);
		this.#table.removeEventListener('input', this, false);
		this.#table.removeEventListener('change', this, false);
	}
	handleEvent(e) {
		if (e.type == "change") this.#changed(e);
		else this.#focused(e);
	}
	#render() {
		const obj = Pageboard.Semafor.flatten(this.value ?? {});
		const body = this.#table.querySelector('tbody');
		body.textContent = '';
		const name = this.name;
		Object.keys(obj).concat([""]).forEach((key, i) => {
			let val = obj[key];
			if (val === undefined || val === null) val = '';
			if (!Array.isArray(val)) val = [val];
			val.forEach((val, j) => {
				body.appendChild(this.dom(`<tr>
					<td><input class="ui input" name="$key-${name}.${i}-${j}" value="${key}" /></td>
					<td><input class="ui input" name="$val-${name}.${i}-${j}" value="${val}" /></td>
				</tr>`));
			});
		});
		this.#restoreSel();
	}
	#focused(e) {
		if (e.target.matches('input')) {
			this.#saveSel(e.target);
		}
	}
	#saveSel(node) {
		this.#selection = {
			name: node.name,
			start: node.selectionStart,
			end: node.selectionEnd,
			dir: node.selectionDirection
		};
	}
	#restoreSel() {
		const sel = this.#selection;
		if (!sel) return;
		const node = this.#table.querySelector(`[name="${sel.name}"]`);
		node?.focus();
		node?.setSelectionRange?.(sel.start, sel.end, sel.dir);
	}
	#changed(e) {
		const map = new Map();
		const removals = [];

		for (const tr of this.#table.querySelector('tbody').children) {
			const key = tr.children[0].firstChild.value;
			let val = map.get(key);
			const inputVal = tr.children[1].firstChild.value;
			if (key) {
				if (val != null) {
					if (!Array.isArray(val)) {
						val = [val];
						map.set(key, val);
					}
					val.push(inputVal);
				} else {
					map.set(key, inputVal);
				}
			} else {
				removals.push(tr);
			}
		}
		this.value = Pageboard.Semafor.unflatten(map);
		for (const node of removals) node.remove();
	}
}
window.customElements.define('input-map', HTMLInputMap);

