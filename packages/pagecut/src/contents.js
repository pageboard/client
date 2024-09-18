export default class Contents {
	constructor(list) {
		if (!list) list = [];
		else if (typeof list == "string") list = [{ nodes: list }];
		else if (!Array.isArray(list)) list = [list];
		this.attrs = [];
		list = list.filter(c => {
			if (!c.nodes) {
				if (c.marks) console.warn("contents has marks without nodes", list);
				this.attrs.push(c);
			} else {
				return true;
			}
		});
		this.list = list;
		this.size = list.length;
		if (this.size == 1 && list[0].id == null) this.unnamed = true;
		this.leaf = list.length == 0;
	}
	get(block, name) {
		if (name == null && !this.unnamed) throw new Error("Missing name parameter");
		if (!block.content) return;
		if (!name) {
			if (block.content[""] !== undefined) name = '';
			else name = Object.keys(block.content)[0];
		}
		return block.content[name];
	}
	set(block, name, val) {
		if (val === undefined && name && typeof name != "string" && name.getAttribute) {
			val = name;
			name = name.getAttribute('block-content');
		}
		if (name == null && !this.unnamed) throw new Error("Missing name parameter");
		if (!block.content) block.content = {};
		block.content[name || ""] = val;
	}
	clear(block, name) {
		if (name == null && !this.unnamed) throw new Error("Missing name parameter");
		if (block.content) {
			delete block.content[name || ""];
		}
	}
	each(block, fn) {
		this.list.forEach(def => {
			const content = this.get(block, def.id);
			if (content != null) fn(content, def);
		});
	}
	find(name) {
		return this.list.find(def => {
			return !def.id || def.id == name;
		});
	}
	get firstId() {
		return this.size == 1 ? this.list[0].id : null;
	}
	normalize(block) {
		const content = block.content;
		if (!content && this.size) {
			block.content = {};
		} else if (content && !this.size) {
			delete block.content;
		}
		if (content && this.unnamed && !this.list[0].virtual) {
			const keys = Object.keys(content);
			if (keys.length == 0) {
				content[""] = "";
			} else if (keys.length == 1) {
				const name = keys[0];
				if (name) {
					content[""] = content[name];
					delete content[name];
				}
			} else {
				console.warn("Failed to normalize block", block);
			}
		}
		return block;
	}
	clone() {
		return new Contents(this.list.slice().map(obj => {
			return { ...obj };
		}));
	}
	prune(block) {
		const copy = {};
		const content = block.content;
		if (content) {
			for (const def of this.list) {
				if (!def.virtual) {
					const cont = content[def.id || ""];
					if (cont !== undefined) copy[def.id || ""] = cont;
				}
			}
			for (const def of this.attrs) {
				const cont = content[def.id];
				if (cont !== undefined) copy[def.id] = cont;
			}
		}
		if (block.virtual && Object.keys(copy).length == 0) return;
		else return copy;
	}
}
