module.exports = function(opt) {
	opt.statics.mounts.push(__dirname + '/public');
	opt.components.push(__dirname + '/public/js/coed-link.js');
};

