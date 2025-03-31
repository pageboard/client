class HTMLElementChartCell extends Page.create(HTMLTableCellElement) {
	static defaults = {
		dataValue: x => parseFloat(x) || 0
	};
	patch(state) {
		this.textContent = this.options.value;
		//return this.closest('table')?.patch(state);
	}
}

Page.define('element-chart-cell', HTMLElementChartCell, 'td');

class HTMLElementChartTable extends Page.create(HTMLTableElement) {
	static defaults = {
		dataPrecision: n => parseInt(n) || null,
		dataChart: null,
		dataUnit: null
	};
	patch(state) {
		const { precision, unit, chart } = this.options;
		this.classList.remove('pie', 'bar', 'column', 'line', 'area', 'ui', 'table', 'charts-css');
		if (chart) {
			this.classList.add('charts-css', chart);
		} else {
			this.classList.add('ui', 'table');
		}
		const tds = this.querySelectorAll('tbody th + td');
		const vals = tds.map(td => td.options.value);
		const sum = vals.reduce((a, b) => a + b, 0) || 1;
		let prev = 0;
		const progressive = ['pie', 'area', 'line'].includes(chart);
		const cumulative = chart == "pie";
		if (progressive && !cumulative) prev = vals[0];
		for (const td of tds) {
			let { value } = td.options;
			td.style.removeProperty('--start');
			td.style.removeProperty('--end');
			td.style.removeProperty('--size');
			const cur = value / sum;
			if (progressive) {
				td.style.setProperty('--start', prev.toPrecision(precision));
				if (cumulative) prev += cur;
				else prev = cur;
				td.style.setProperty('--end', prev.toPrecision(precision));
			} else if (chart) {
				td.style.setProperty('--size', cur.toPrecision(precision));
			}
			if (unit) value += ' ' + unit;
			td.textContent = value;
		}
	}
}

Page.define('element-chart-table', HTMLElementChartTable, 'table');

