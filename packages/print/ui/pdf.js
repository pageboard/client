// VirtualHTMLElement replaces it by a stub that calls back immediately
window.IntersectionObserver = null;
Page.patch((state) => {
	state.vars['pdf.quality'] = true;
	state.vars['pdf.paper'] = true;

	const ratios = {
		default: 1,
		screen: 1,
		ebook: 2,
		prepress: 4,
		printer: 4
	};
	const quality = state.query['pdf.quality'] || 'default';
	if (Object.keys(ratios).includes(quality)) {
		window.devicePixelRatio = ratios[quality];
	} else {
		state.status = 400;
	}

	const paper = state.query['pdf.paper'] || 'iso_a4';
	if (['iso_a4'].includes(paper) == false) {
		state.status = 400;
	}
	if (state.pathname.endsWith('.pdf') == false) {
		delete Page.serialize;
	}
});

Page.serialize = function(state) {
	if (state.status >= 400) {
		const err = new Error("Bad Parameters");
		err.statusCode = state.status;
		throw err;
	}
	return {
		title: document.title,
		quality: state.query['pdf.quality'],
		paper: state.query['pdf.paper'],
		margins: '0mm'
	};
};

