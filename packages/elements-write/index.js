exports.file = function(app, api, config) {
	config.statics.mounts.push(__dirname + '/public');
	config.components.push(__dirname + '/public/js/coed-link.js');
};

