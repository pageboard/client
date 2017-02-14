module.exports = function(opt) {
	opt.statics.mounts.push(__dirname + '/public');
	return {
		view: init
	};
};

function init(All) {
	All.app.get('*', function(req, res, next) {
		if (req.query.write !== undefined) next();
		else next('route');
	}, All.dom('write').load());
}
