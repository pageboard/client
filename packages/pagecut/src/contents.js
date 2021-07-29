exports.Contents = class Contents {
	constructor(list) {
		if (!list) list = [];
		else if (typeof list == "string") list = [{ nodes: list }];
		else if (!Array.isArray(list)) list = [list];
		this.list = list;
		this.size = this.list.length;
		if (this.size == 1 && this.list[0].id == null) this.unnamed = true;
		this.leaf = this.size == 0;
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
		this.list.forEach((def) => {
			const content = this.get(block, def.id);
			if (content != null) fn(content, def);
		});
	}
	find(name) {
		return this.list.find((def) => {
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
			const name = Object.keys(content)[0];
			if (name) {
				content[""] = content[name];
				delete content[name];
			}
			if (Object.keys(content).length != 1) console.warn("Failed to normalize block", block);
		}
		return block;
	}
	clone() {
		return new Contents(this.list.slice().map((obj) => Object.assign({}, obj)));
	}
	prune(block) {
		const copy = {};
		const content = block.content;
		if (content) this.list.forEach((def) => {
			if (!def.virtual) {
				const cont = content[def.id || ""];
				if (cont !== undefined) copy[def.id || ""] = cont;
			}
		});
		if (block.virtual && Object.keys(copy).length == 0) return;
		else return copy;
	}
};
