(function(exports) {

if (!exports.grid) exports.grid = {};

exports.grid.view = function(doc, block) {
	var div = doc.createElement('div');
	div.className = 'ui grid';
	return div;
};

})(window.Pagecut.modules);
