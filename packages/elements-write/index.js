var readFile = require('util').promisify(require('fs').readFile);
var Path = require('path');

module.exports = function(opt) {
	return {
		priority: 10,
		view: init
	};
};

function init(All) {
	return readFile(Path.join(__dirname, 'write', 'write.html')).then(function(buf) {
		All.app.get('*', function(req, res, next) {
			if (req.query.write !== undefined) {
				// doesn't actually load the html
				All.dom(buf)(req, res, next);
			} else {
				next('route');
			}
		});
	});
}
