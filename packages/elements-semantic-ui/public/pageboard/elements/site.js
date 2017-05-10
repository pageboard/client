(function(exports) {

exports.site = {
	required: ['name', 'url'],
	properties : {
		name: {
			type: 'string'
		},
		url: {
			type: 'string'
		}
	}
};

})(typeof exports == "undefined" ? window.Pagecut.modules : exports);
