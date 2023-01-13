Page.patch(state => {
	state.finish(() => {
		const entitled = document.querySelector('h1[entitled]');
		if (entitled) {
			document.title = entitled.textContent + ' - ' + document.title;
		}
	});
});
