Page.patch(function(state) {
	const ogImage = document.head.querySelector('meta[property="og:image"]');
	if (ogImage) {
		const image = ogImage.querySelector('element-image');
		if (image) {
			const obj = Page.parse(image.dataset.src);
			obj.query = {rs: 'w-800_h-450_max'};
			ogImage.setAttribute('content', document.location.origin + Page.format(obj));
			ogImage.removeAttribute('block-content');
			ogImage.innerText = '';
		}
	}
	const ogDesc = document.head.querySelector('meta[property="og:description"]');
	if (ogDesc) {
		ogDesc.setAttribute('content', ogDesc.innerText);
		ogDesc.removeAttribute('block-content');
		ogDesc.innerText = '';
	}
});
