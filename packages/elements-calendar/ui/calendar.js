HTMLElementQuery.filters.toDate = function(val, expr, amount, unit) {
	var d = new Date(val);
	amount = parseInt(amount);
	if (!isNaN(amount)) {
		if (!unit) unit = 'day';
		else unit = unit.toLowerCase();
		if (unit.endsWith('s')) unit = unit.slice(0, -1);
		var name = {
			day: 'Date',
			month: 'Month',
			year: 'FullYear',
			hour: 'Hours',
			minute: 'Minutes',
			second: 'Seconds'
		}[unit];
		if (!name) throw new Error("Unknown modDate unit " + unit);
		d[`set${name}`](d[`get${name}`]() + amount);
	}
	return d;
};

HTMLElementQuery.filters.isoDate = function(val) {
	var d = new Date(val);
	return d.toISOString().split('T').shift();
};

HTMLElementQuery.filters.isoTime = function(val) {
	var d = new Date(val);
	return d.toISOString().split('T').pop();
};

HTMLElementQuery.filters.langDate = function(val, expr, comp, opt, lang) {
	var d = new Date(val);
	var opts = {};
	// DateTimeFormat options, some of them are
	// unit: weekday, month
	// how: narrow, short, long
	opts[comp] = opt || 'long';
	if (!lang) lang = document.documentElement.lang || window.navigator.language;
	return d.toLocaleString(lang, opts);
};
