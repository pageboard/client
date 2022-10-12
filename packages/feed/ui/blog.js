Page.patch(state => {
	const ogImage = document.head.querySelector('meta[property="og:image"]');
	if (ogImage) {
		const image = ogImage.querySelector('element-image');
		if (image) {
			const loc = Page.parse(image.dataset.src);
			loc.query = {rs: 'w-800_h-450_max'};
			ogImage.setAttribute('content', document.location.origin + loc.toString());
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
