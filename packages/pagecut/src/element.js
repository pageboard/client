import Contents from './contents';

export default class Element {
	constructor(elt) {
		Object.assign(this, elt);
		if (!elt.contents || !elt.contents.list) {
			this.contents = new Contents(elt.contents);
		}
	}
	create(obj) {
		obj = { ...obj };
		obj.type = this.name;
		if (this.standalone) obj.standalone = true;
		return obj;
	}
	clone() {
		const el = new Element(this);
		for (const [key, val] of Object.entries(this)) {
			if (Array.isArray(val)) el[key] = val.slice();
		}
		el.contents = el.contents.clone();
		return el;
	}
	get leaf() {
		return this.contents.leaf;
	}
}
