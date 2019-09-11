module.exports = function(obj) {
	var head = document.head;
	Object.entries(obj).forEach(([name, content]) => {
		var node = head.querySelector(`meta[http-equiv="${name}"]`);
		head.appendChild(head.dom(
			`<meta http-equiv="${name}" content="${content}">`
		));
	});
};
