window.Pagecut = {modules:{}};
window.Pageboard = {
	Controls: {},
	trigger: function(node, event) {
		var e = document.createEvent('Event');
		e.initEvent(event, true, true);
		node.dispatchEvent(e);
	}
};

Page.setup(function(state) {
	Pageboard.setup();
});


