var fs = require('fs');
var Path = require('path');

module.exports = function(opt) {
	opt.statics.mounts.push(__dirname + '/public');
};

var elementsRoot = 'elements';
var elements = module.exports.elements = {};

fs.readdirSync(Path.join(__dirname, elementsRoot)).forEach(function(mpath) {
	var ext = Path.extname(mpath);
	var base = Path.basename(mpath, ext);
	Object.assign(elements, require('./' + Path.join(elementsRoot, base)));
});

