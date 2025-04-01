class HTMLElementChartValue extends Page.create(HTMLTableCellElement) {
	static defaults = {
		dataValue: x => parseFloat(x) || 0
	};
	patch(state) {
		this.update(this.closest('table')?.options ?? {});
	}
	update({ precision, unit }) {
		let { value } = this.options;
		value = value.toFixed(precision);
		if (unit) value += ' ' + unit;
		this.innerHTML = `<span class="data">${value}</span>`;
	}
}

Page.define('element-chart-value', HTMLElementChartValue, 'td');

class HTMLElementChartTable extends Page.create(HTMLTableElement) {
	static defaults = {
		dataPrecision: n => parseInt(n) || null,
		dataChart: null,
		dataUnit: null
	};
	patch(state) {
		const { chart } = this.options;
		this.classList.remove('pie', 'bar', 'column', 'line', 'area', 'ui', 'table', 'charts-css');
		if (chart) {
			this.classList.add('charts-css', chart);
		} else {
			this.classList.add('ui', 'table');
		}
		const tds = this.querySelectorAll('tbody th + td');
		const vals = tds.map(td => td.options.value);
		let prev = 0;
		const progressive = ['pie', 'area', 'line'].includes(chart);
		const cumulative = chart == "pie";
		if (progressive && !cumulative) prev = vals[0];
		const max = cumulative ? vals.reduce((a, b) => a + b, 0) || 1 : Math.max(...vals.map(x => Math.abs(x)));
		for (const td of tds) {
			td.style.removeProperty('--start');
			td.style.removeProperty('--end');
			td.style.removeProperty('--size');
			const cur = td.options.value / max;
			if (progressive) {
				td.style.setProperty('--start', prev);
				if (cumulative) prev += cur;
				else prev = cur;
				td.style.setProperty('--end', prev);
			} else if (chart) {
				td.style.setProperty('--size', cur);
			}
			td.update(this.options);
		}
	}
}

Page.define('element-chart-table', HTMLElementChartTable, 'table');

