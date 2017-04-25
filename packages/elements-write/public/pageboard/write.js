window.Pagecut = {modules:{}};
window.Pageboard = {
	Controls: {},
	trigger: function(node, event) {
		var e = document.createEvent('Event');
		e.initEvent(event, true, true);
		node.dispatchEvent(e);
		if (window.Pageboard.editor) window.Pageboard.editor.focus();
	}
};

Page.setup(function(state) {
	Pageboard.setup();
});


