Page.patch(state => {
	state.finish(() => {
		const heading = document.body.querySelector('element-template > .view h1');
		if (!heading) return;
		const title = document.head.querySelector('title');
		if (!title) return;
		title.textContent = heading.textContent.trim() + ' - ' + title.textContent;
	});
});
