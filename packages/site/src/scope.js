export default class Scope {
	#state;

	constructor(state, obj = {}) {
		this.#state = state;
		Object.assign(this, obj);
	}
	get $loc() {
		return this.#state;
	}
	get $pathname() {
		return this.#state.pathname;
	}
	get $query() {
		return this.#state.query;
	}
	get $referrer() {
		return this.#state.referrer.pathname ?? this.$pathname;
	}
	copy(extra) {
		const scope = new Scope(this.#state, this);
		if (extra) Object.assign(scope, extra);
		return scope;
	}
	update(state) {
		this.#state = state;
	}
}
