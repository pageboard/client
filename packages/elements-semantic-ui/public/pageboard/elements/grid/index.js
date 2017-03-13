(function(exports) {

if (!exports.grid) exports.grid = {};
exports.grid.title = "Grid";
exports.grid.properties = {};
exports.grid.specs = {
	columns: "grid_column+"
};
exports.grid.menu = 'layout';
exports.grid.group = "block";


if (!exports.grid_column) exports.grid_column = {};
exports.grid_column.title = "Column";
exports.grid_column.properties = {
	width: {
		title: 'Column width',
		type: "integer",
		minimum: 1,
		maximum: 4,
		default: 1
	}
};
exports.grid_column.specs = {
	content: "block+"
};
exports.grid_column.menu = 'layout';

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);

