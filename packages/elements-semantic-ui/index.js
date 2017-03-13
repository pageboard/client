var fs = require('fs');
var Path = require('path');

module.exports = function(opt) {
	opt.statics.mounts.push(__dirname + '/public');

	var elementsRoot = Path.join(__dirname, 'public/pageboard/elements');

	fs.readdirSync(elementsRoot).forEach(function(mpath) {
		opt.elements.push(Path.join(elementsRoot, mpath));
	});
};

