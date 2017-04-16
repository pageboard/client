(function(Pageboard) {

var root;

Pageboard.notify = function(title, text) {
	var parent = Pageboard.notify.dom();
	parent.insertAdjacentHTML('beforeEnd', [
	'<div class="ui negative message">',
		'<i class="close icon"></i>',
		'<div class="header">',
			title,
		'</div>',
		'<p>' + text + '</p>',
	'</div>'
	].join('\n'));
	var msg = parent.lastChild;
	msg.addEventListener('click', function() {
		msg.remove();
	});
};

Pageboard.notify.dom = function() {
	if (root) return root;
	root = document.getElementById('notifications');
	return root;
};

})(window.Pageboard);
