class HTMLElementFieldsetList extends VirtualHTMLElement {

	setup(state) {
		if (this.isContentEditable) return;
		const [data, list, model] = this.listData;
		if (list.length == 0 && this.hasAttribute('required')) {
			list.push(model);
			this.listRender(data, state.scope);
		}
	}

	listRender(data, scope) {
		const view = this.listView;
		view.textContent = '';
		view.appendChild(this.listTpl.cloneNode(true).fuse(data, scope));
	}

	handleClick(e, state) {
		if (this.isContentEditable) return;
		const btn = e.target.closest('button[type="button"][name]');
		if (!btn) return;
		if (["add", "del"].includes(btn.name) == false) return;
		const index = parseInt(btn.value);
		if (Number.isNaN(index)) throw new Error("Missing index on button: " + btn.outerHTML);
		const [data, list, model] = this.listData;
		if (btn.name == "add") {
			list.splice(index + 1, 0, model);
		} else if (btn.name == "del") {
			list.splice(index, 1);
			if (list.length == 0 && this.hasAttribute('required')) list.push(model);
		}
		this.listRender(data, state.scope);
	}

	get listData() {
		const query = {};
		let listPrefix, inputPrefix;
		const model = {};
		this.listTpl.cloneNode(true).fuse({}, {
			$filters: {
				"|": function (val, what) {
					if (listPrefix == null) {
						const iterMark = what.expr.path.findIndex(str => str.endsWith('+'));
						if (iterMark >= 0) {
							listPrefix = what.expr.path.slice(0, iterMark + 1).join('.').slice(0, -1);
							if (what.expr.get(what.data, listPrefix) == null) {
								const list = listPrefix.split('.');
								let curData = what.data;
								list.forEach((it, i, arr) => {
									if (curData[it] == null) {
										if (arr.length == i + 1) {
											curData = curData[it] = [{}];
										} else {
											curData = curData[it] = {};
										}
									}
								});
							}
						}
					}

					if (what.expr.path[what.expr.path.length - 1] == "key") {
						// this is probably the index
						if (what.index < what.hits.length - 1) {
							const valKey = what.hits[what.index + 1];
							if (inputPrefix == null && what.hits.length > 1) inputPrefix = what.hits[0].slice(0, -1);
							model[valKey.substring(1)] = "";
						}
					}
				}
			}
		});
		if (listPrefix == null) throw new Error("Template must have prefixed inputs");
		let listInputPrefix = "";
		if (listPrefix.endsWith(inputPrefix)) {
			listInputPrefix = listPrefix.slice(0, -inputPrefix.length);
		}
		const list = query[listPrefix] = [];

		this.listView.querySelectorAll(`[name^="${inputPrefix}."]`).forEach(node => {
			const val = node.value;
			const name = listInputPrefix + node.name;
			switch (node.type) {
				case "radio":
					if (node.checked) query[name] = val;
					break;
				case "checkbox":
					if (node.checked) {
						if (query[name] == null) query[name] = [];
						query[name].push(val);
					}
					break;
				case "select-multiple":
					query[name] = Array.prototype.map.call(node.selectedOptions, x => {
						if (x.value == null) return x.innerText;
						else return x.value;
					});
					break;
				default:
					query[name] = val;
			}
		});
		// unflatten
		const data = this.unflatten(query);
		return [data, list, this.unflatten(model)];
	}
	unflatten(query) {
		const data = {};
		Object.keys(query).forEach(acc => {
			let obj = data;
			acc.split('.').forEach((key, i, arr) => {
				if (obj[key] == null) {
					if (i == arr.length - 1) obj[key] = query[acc];
					else obj[key] = {};
				}
				obj = obj[key];
			});
		});
		return data;
	}
	get listTpl() {
		return this.firstElementChild.content;
	}
	get listView() {
		return this.lastElementChild;
	}
}


VirtualHTMLElement.define('element-fieldset-list', HTMLElementFieldsetList);



