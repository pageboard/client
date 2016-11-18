module.exports = function(plugins) {
  plugins.files.push(init);
};

function init(app, api, config) {
	config.statics.files.push('public/js/coed.js');
}

