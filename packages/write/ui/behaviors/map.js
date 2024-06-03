class HTMLElementInputMap extends HTMLInputElement {
	#table;
	#selection;

	constructor() {
		super();
		this.setAttribute('is', 'element-input-map');
		this.hidden = true;
	}

	#parse(str) {
		try {
			return JSON.parse(str || '{}');
		} catch (ex) {
			console.error(ex);
		}
	}

	get value() {
		return this.getAttribute('value');
	}

	set value(str) {
		if (str == this.getAttribute('value')) return;
		this.setAttribute('value', str);
		this.#render(this.#parse(str));
	}
	connectedCallback() {
		this.#table = this.parentNode.insertBefore(this.dom(`<table class="ui very compact celled striped attached table">
			<tbody></tbody>
		</table>`), this.nextSibling);
		this.#table.addEventListener('change', this, false);
		this.#table.addEventListener('input', this, false);
		this.#table.addEventListener('focus', this, true);
		this.#render(this.#parse(this.value));
	}
	disconnectedCallback() {
		this.#table.removeEventListener('focus', this, true);
		this.#table.removeEventListener('input', this, false);
		this.#table.removeEventListener('change', this, false);
		this.#table.remove();
		this.#table = null;
	}
	handleEvent(e) {
		if (e.type == "change" && e.target != this) this.#changed(e);
		else if (e.type == "input" || e.type == "focus") this.#focused(e);
	}
	#render(obj = {}) {
		const flat = Pageboard.Semafor.flatten(obj);
		const body = this.#table.querySelector('tbody');
		body.textContent = '';
		const name = this.name;
		Object.keys(flat).concat([""]).forEach((key, i) => {
			let val = flat[key];
			if (val === undefined || val === null) val = '';
			if (!Array.isArray(val)) val = [val];
			val.forEach((val, j) => {
				body.appendChild(this.dom(`<tr>
					<td><input class="ui input" name="$key-${name}.${i}-${j}" value="${key}" /></td>
					<td><textarea  name="$val-${name}.${i}-${j}" is="semafor-textarea">${val}</textarea></td>
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
		this.value = JSON.stringify(Pageboard.Semafor.unflatten(map));
		for (const node of removals) node.remove();
		Pageboard.trigger(this, 'change');
	}
}
window.customElements.define('element-input-map', HTMLElementInputMap, { extends: "input"});

