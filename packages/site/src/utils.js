const Arr = Array.prototype;

Arr.ancestor = function () {
	const list = this.slice();
	let parent = list.shift();
	if (!parent) return;
	if (typeof parent.contains != "function") {
		throw new TypeError("Expected an array of DOM elements");
	}
	do {
		if (list.every(node => parent.contains(node))) {
			return parent;
		}
		parent = parent.parentNode;
	} while (parent);
};

for (const name of [
	'filter', 'some', 'map', 'forEach',
	'indexOf', 'find', 'includes', 'reduce',
	'slice', 'ancestor', 'every'
]) {
	NodeList.prototype[name] ??= Arr[name];
	HTMLCollection.prototype[name] ??= Arr[name];
}

Node.prototype.queryClosest = function (sel) {
	if (this.matches(sel)) return this;
	else return this.querySelector(sel);
};

Object.defineProperty(DocumentFragment.prototype, 'innerHTML', {
	configurable: true,
	get() {
		return this.childNodes.map(child => {
			if (child.nodeType == Node.TEXT_NODE) return child.nodeValue;
			else return child.outerHTML;
		}).join('');
	}
});

