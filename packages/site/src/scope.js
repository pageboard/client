export default class Scope {
	#state;

	constructor(state, obj = {}) {
		this.#state = state;
		Object.assign(this, obj);
	}
	get $loc() {
		const obj = new URL(this.#state.toString(), document.location);
		obj.query = { ...this.$query };
		return obj;
	}
	get $pathname() {
		return this.#state.pathname;
	}
	get $query() {
		return this.#state.query;
	}
	copy(extra) {
		const scope = new Scope(this.#state, this);
		if (extra) Object.assign(scope, extra);
		return scope;
	}
}
