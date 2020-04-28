Page.patch(function(state) {
	const ogImage = document.head.querySelector('meta[property="og:image"]');
	if (!ogImage) return;
	const image = ogImage.querySelector('element-image');
	if (!image) return;
	const obj = Page.parse(image.dataset.src);
	obj.query = {rs: 'w-800_h-450_max'};
	ogImage.setAttribute('content', Page.format(obj));
	ogImage.removeAttribute('block-content');
	ogImage.innerText = '';
});
