const Arr = Array.prototype;

Arr.ancestor = function() {
	const list = this.slice();
	let parent = list.shift();
	if (!parent) return;
	if (typeof parent.contains != "function") {
		throw new TypeError("Expected an array of DOM elements");
	}
	do {
		if (list.every((node) => parent.contains(node))) {
			return parent;
		}
		parent = parent.parentNode;
	} while (parent);
};

[
	'filter', 'some', 'map', 'forEach',
	'indexOf', 'find', 'includes', 'reduce',
	'slice', 'ancestor'
].forEach((name) => {
	if (!NodeList.prototype[name]) NodeList.prototype[name] = Arr[name];
	if (!HTMLCollection.prototype[name]) HTMLCollection.prototype[name] = Arr[name];
});

Node.prototype.queryClosest = function(sel) {
	if (this.matches(sel)) return this;
	else return this.querySelector(sel);
};
