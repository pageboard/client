// VirtualHTMLElement replaces it by a stub that calls back immediately
window.IntersectionObserver = null;
Page.patch(function(state) {
	state.vars['pdf.quality'] = true;
	state.vars['pdf.paper'] = true;

	var ratios = {
		default: 1,
		screen: 1,
		ebook: 2,
		prepress: 4,
		printer: 4
	};
	var quality = state.query['pdf.quality'] || 'default';
	if (Object.keys(ratios).includes(quality)) {
		window.devicePixelRatio = ratios[quality];
	} else {
		state.statusCode = 400;
	}

	var paper = state.query['pdf.paper'] || 'iso_a4';
	if (['iso_a4'].includes(paper) == false) {
		state.statusCode = 400;
	}
	if (state.pathname.endsWith('.pdf') == false) {
		delete Page.serialize;
	}
});

Page.serialize = function(state) {
	if (state.statusCode) {
		var err = new Error("Bad Parameters");
		err.statusCode = state.statusCode;
		throw err;
	}
	return {
		title: document.title,
		quality: state.query['pdf.quality'],
		paper: state.query['pdf.paper'],
		margins: '0mm'
	};
};

