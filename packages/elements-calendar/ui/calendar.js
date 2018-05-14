HTMLElementQuery.filters.parseDate = function(val, expr, amount, unit) {
	if (val && /^\d\d:\d\d/.test(val)) {
		val = '0 ' + val;
	}
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

HTMLElementQuery.filters.toTime = function(val) {
	if (!val) return val;
	return HTMLElementQuery.filters.parseDate(val).toISOString().split('T').pop().split('.').shift();
};

HTMLElementQuery.filters.toDate = function(val) {
	if (!val) return val;
	return HTMLElementQuery.filters.parseDate(val).toISOString().split('T').shift();
};

HTMLElementQuery.filters.formatDate = function(val, expr, ...list) {
	if (/^\d\d:\d\d(:\d\d)?$/.test(val)) {
		val = '1970-01-01T' + val + 'Z';
	}
	var d = new Date(val);
	var p = {};
	const n = 'narrow';
	const s = 'short';
	const l = 'long';
	const num = 'numeric';
	const dig = '2-digit';
	list.forEach(function(tok) {
		switch(tok) {
			case 'd': p.weekday = n; break;
			case 'da': p.weekday = s; break;
			case 'day': p.weekday = l; break;
			case 'Y': p.year = num; break;
			case 'YY': p.year = dig; break;
			case 'mo': p.month = n; break;
			case 'mon': p.month = s; break;
			case 'month': p.month = l; break;
			case 'M': p.month = num; break;
			case 'MM': p.month = dig; break;
			case 'D': p.day = num; break;
			case 'DD': p.day = dig; break;
			case 'H': p.hour = num; break;
			case 'HH': p.hour = dig; break;
			case 'm': p.minute = num; break;
			case 'mm': p.minute = dig; break;
			case 's': p.second = num; break;
			case 'ss': p.second = dig; break;
			case 'tz': p.timeZoneName = s; break;
			case 'timezone': p.timeZoneName = l; break;
			default: console.warn("Unrecognized date format option", tok); break;
		}
	});
	var lang = document.documentElement.lang || window.navigator.language;
	return d.toLocaleString(lang, p);
};
