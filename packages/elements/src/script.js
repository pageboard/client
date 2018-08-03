module.exports = function(src) {
	var node = document.createElement('script');
	node.src = src;
	return new Promise(function(resolve, reject) {
		node.addEventListener('load', function() {
			node.remove();
			resolve();
		});
		node.addEventListener('error', function() {
			node.remove();
			var err = new Error(`Cannot load ${src}`);
			err.code = 404;
			reject(err);
		});
		document.head.appendChild(node);
	});
};
