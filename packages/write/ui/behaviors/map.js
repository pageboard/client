class HTMLElementInputMap extends HTMLInputElement {
	#table;
	#selection;
	#value;

	constructor() {
		super();
		this.setAttribute('is', 'element-input-map');
		this.hidden = true;
	}

	get value() {
		return this.#value;
	}

	set value(obj) {
		if (obj != null && !(obj instanceof Map)) {
			Pageboard.notify("Unsupported value in input map", { message: obj });
			obj = null;
		}
		this.#value = obj;
		this.#render(obj);
	}
	connectedCallback() {
		this.#table = this.parentNode.insertBefore(this.dom(`<table class="ui very compact celled striped attached table">
			<tbody></tbody>
		</table>`), this.nextSibling);
		this.#table.addEventListener('change', this, false);
		this.#table.addEventListener('input', this, false);
		this.#table.addEventListener('focus', this, true);
	}
	disconnectedCallback() {
		this.#table.removeEventListener('focus', this, true);
		this.#table.removeEventListener('input', this, false);
		this.#table.removeEventListener('change', this, false);
		this.#table.remove();
		this.#table = null;
	}
	handleEvent(e) {
		if (e.type == "change" && e.target != this) {
			// let focus happen first to save selection
			setTimeout(() => this.#changed(e));
		} else if (e.type == "input" || e.type == "focus") {
			this.#focused(e);
		}
	}
	#render(obj) {
		if (!obj) obj = new Map();
		const body = this.#table.querySelector('tbody');
		body.textContent = '';
		const name = this.name;
		const flats = Pageboard.Semafor.flatten(Object.fromEntries(obj.entries()));
		Object.entries(flats).concat([["", null]]).forEach(([key, val], i) => {
			if (val === undefined || val === null) val = '';
			if (!Array.isArray(val)) val = [val];
			val.forEach((val, j) => {
				body.appendChild(this.dom(`<tr>
					<td><input class="ui input" name="!key-${name}.${i}-${j}" value="${key}" /></td>
					<td><textarea name="!val-${name}.${i}-${j}" is="semafor-textarea">${val}</textarea></td>
				</tr>`));
			});
		});
		this.#restoreSel();
	}
	#focused(e) {
		if (e.target?.matches('input,textarea')) {
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
		this.#value = map;
		for (const node of removals) node.remove();
		Pageboard.trigger(this, 'change');
	}
}
window.customElements.define('element-input-map', HTMLElementInputMap, { extends: "input"});

