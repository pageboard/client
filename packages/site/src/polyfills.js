const Arr = Array.prototype;
['filter', 'some', 'map', 'forEach', 'indexOf', 'find', 'includes'].forEach((name) => {
	if (!NodeList.prototype[name]) NodeList.prototype[name] = Arr[name];
	if (!HTMLCollection.prototype[name]) HTMLCollection.prototype[name] = Arr[name];
});

