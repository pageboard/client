(function(exports) {

if (!exports.grid) exports.grid = {};

exports.grid.view = function(doc, block) {
	var div = doc.createElement('div');
	div.className = 'ui doubling stackable equal width grid';
	div.setAttribute('block-content', 'columns');
	div.setAttribute('block-type', 'grid');
	return div;
};


if (!exports.grid_column) exports.grid_column = {};

exports.grid_column.view = function(doc, block) {
	var div = doc.createElement('div');
	var prefix = '';
	if (block.data.width != null) prefix = {
		0: '',
		1: 'one',
		2: 'two',
		3: 'three',
		4: 'four',
		5: 'five',
		6: 'six',
		7: 'seven',
		8: 'eight',
		9: 'nine',
		10: 'ten',
		11: 'eleven',
		12: 'twelve',
		13: 'thirteen',
		14: 'fourteen',
		15: 'fifteen',
		16: 'sixteen'
	}[block.data.width];
	if (prefix) prefix += " wide ";
	div.className = prefix + 'column';
	div.setAttribute('block-content', 'content');
	div.setAttribute('block-type', 'gridcolumn');
	return div;
};

})(window.Pagecut.modules);
