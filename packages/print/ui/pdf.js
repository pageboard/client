Page.patch(state => {
	const { pages, spine } = state.query;
	if (pages != null && /^\d+-?\d*$/.test(pages)) {
		state.vars.pages = true;
	}
	if (spine != null && !Number.isNaN(parseFloat(spine))) {
		state.vars.spine = true;
	}
});
Page.setup(state => {
	removePrintButtons();
	const opts = document.body.dataset;

	if (window.devicePixelRatio < 4 && window.matchMedia('print').matches) {
		// TODO
	}
	const {
		width = '210mm',
		height = '297mm',
		margin = '0mm',
		foldWidth = false,
		foldHeight = false,
		sheetcounterOffset = '0'
	} = opts;

	if (state.vars.spine) {
		// TODO
		console.warn("Got spine", state.query.spine);
	}

	document.documentElement.style.setProperty(
		'--pdfmargin',
		margin === '0' ? '0mm' : margin
	);

	const folds = {
		width: foldWidth ? 2 : 1,
		height: foldHeight ? 2 : 1
	};
	const className = 'page-sheet';
	state.scope.printStyleSheet = printStyle(
		className,
		roundedFoldedDims(folds, convertUnits({ width, height, margin })),
		{ width, height }
	);
	if (state.scope.$write) {
		return;
	}
	autobreakFn(className);
	pageNumbering(parseInt(sheetcounterOffset), className);

	if (state.vars.pages) {
		prunePages(Array.from(document.body.querySelectorAll(`.${className}`)), state.query.pages);
	}
	if (state.pathname.endsWith('.pdf') == false) {
		showPrintButtons(state, opts.preset);
	} else {
		state.scope.observer?.disconnect();
		delete state.scope.observer;
	}
});

Page.close(state => {
	const ass = document.adoptedStyleSheets;
	const index = ass.indexOf(state.scope.printStyleSheet);
	delete state.scope.printStyleSheet;
	if (index >= 0) ass.splice(index, 1);
});

function prunePages(sheets, range) {
	if (range.endsWith('-')) range += sheets.length;
	else if (!range.includes('-')) range += '-' + range;
	const [start, end] = range.split('-');
	for (let i = 1; i <= sheets.length; i++) {
		if (i < start || i > end) sheets[i - 1].remove();
	}
}

function showPrintButtons(state, preset) {
	const root = document.documentElement;
	const target = {
		pathname: state.pathname + ".pdf",
		query: state.query
	};
	if (preset) target.query.pdf = preset;
	root.appendChild(root.dom(`<div class="pdf-menu">
		<a target="_blank" href="${state.format(target)}">⎙</a>
	</div>`));
}

function removePrintButtons() {
	document.querySelector('html > .pdf-menu')?.remove();
}

function printStyle(className, sheetSize, pageSize) {
	const { margin, width, height } = sheetSize;
	const effectiveSheet = new CSSStyleSheet();
	const printSheet = `
	html, body {
		padding: 0;
		margin: 0;
	}
	@media screen {
		html, body {
			background: gray;
		}
		body {
			width: ${pageSize.width};
		}
		.${className} {
			margin: 1rem auto;
			width: ${width}px;
			height: ${height}px;
			border: ${margin}px solid transparent;
			outline: rgba(0 0 0 / 6%) dashed min(1px, ${margin}px);
			outline-offset: -${margin}px;
			background: white;
			overflow:clip;
			overflow-clip-margin: content-box ${margin}px;
		}
	}
	@media print {
		html, body {
			background:white;
		}
		@page {
			size: ${pageSize.width} ${pageSize.height};
			margin: 0;
		}
		.${className} {
			margin: ${margin}px;
			width: ${width - 2 * margin}px;
			height: ${height - 2 * margin}px;
			overflow:clip;
			overflow-clip-margin: content-box ${margin}px;
		}
	}`;

	effectiveSheet.replaceSync(printSheet);
	document.adoptedStyleSheets.push(effectiveSheet);
	return effectiveSheet;
}

function autobreakFn(className) {
	function checkRange(rect, range) {
		const rangeRect = range.getBoundingClientRect();
		return Math.round((rangeRect.bottom - rect.bottom) * 10) > 0;
	}
	function findRangeStart(obj, parent) {
		const { rect, range } = obj;
		for (let i = 0; i < parent.childNodes.length; i++) {
			const node = parent.childNodes[i];
			if (node.nodeType == 1) {
				range.setEndAfter(node);
				if (checkRange(rect, range)) {
					if (node.childNodes.length == 0) {
						// leaf node
					} else {
						const breakInside = window.getComputedStyle(node).breakInside;
						if (['avoid', 'avoid-page'].includes(breakInside) == false) {
							findRangeStart(obj, node);
						}
					}
					return true;
				}
			} else {
				for (let j = 0; j < node.length; j++) {
					range.setEnd(node, j + 1);
					if (checkRange(rect, range)) {
						// one step back
						range.setEnd(node, j);
						return true;
					}
				}
			}
		}
	}

	function fillSheet(sheet) {
		const obj = {
			rect: sheet.getBoundingClientRect(), // odd that range(sheet).getBounding.. doesn't work - check it
			range: new Range()
		};
		obj.range.setStart(sheet, 0);
		if (findRangeStart(obj, sheet)) {
			obj.range.setStart(obj.range.endContainer, obj.range.endOffset);
			obj.range.setEndAfter(sheet);
			const contents = obj.range.extractContents();
			const nextPage = contents.firstElementChild;
			if (nextPage.isEqualNode(sheet) == false) {
				nextPage.classList.add(className + '-next');
				sheet.after(nextPage);
				fillSheet(nextPage);
			} else {
				sheet.classList.add(className + '-error');
			}
		}
	}

	for (const sheet of document.querySelectorAll(`.${className}`)) {
		fillSheet(sheet);
	}
}

function pageNumbering(start, className) {
	const sheets = document.querySelectorAll(`.${className}`);
	let offset = Number.isNaN(start) ? 0 : start;
	let first = 0;
	for (let i = 0; i < sheets.length; i++) {
		const sheet = sheets[i];
		if (sheet.classList.contains(className + '-skip')) {
			offset += 1;
		}
		if (i === 0) {
			first = offset;
			sheet.classList.add(className + '-first');
		} else if (i === sheets.length - 1) {
			sheet.classList.add(className + '-last');
		}
		sheet.classList.add(className + ((i + offset) % 2 === 0 ? '-right' : '-left'));
	}
	document.body.style.counterSet = [
		'sheet', -first,
		'sheets', sheets.length - offset
	].join(' ');
}

function convertUnits(styles) {
	const d = document.body.appendChild(document.createElement('div'));
	Object.assign(d.style, styles, {
		display: 'block',
		position: 'absolute'
	});
	const obj = {};
	const cs = window.getComputedStyle(d);
	for (const key of Object.keys(styles)) obj[key] = cs[key];
	d.remove();

	// get decimal values in pixels
	obj.width = parseFloat(obj.width);
	obj.height = parseFloat(obj.height);
	obj.margin = parseFloat(obj.margin);

	return obj;
}

function roundedFoldedDims(folds, box) {
	let w = Math.round(box.width / folds.width);
	const h = box.height / folds.height;
	const ch = w * (box.height / box.width) * (folds.width / folds.height);
	if (ch > h) w += -1;
	return {
		margin: Math.round(box.margin),
		width: w,
		height: Math.floor(h)
	};
}
