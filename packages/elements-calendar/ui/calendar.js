HTMLElementQuery.filters.parseDate = function(val, what, amount, unit) {
	var d;
	if (val instanceof Date) {
		d = val;
	} else {
		if (val && /^\d\d:\d\d/.test(val)) {
			val = '0 ' + val;
		}
		d = new Date(val);
	}
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
		d[`setUTC${name}`](d[`getUTC${name}`]() + amount);
	}
	return d;
};

HTMLElementQuery.filters.thatday = function(val, what, hours, minutes) {
	if (val != null) return val;
	var queryDate = what.data.$query && what.data.$query.date;
	var d = new Date(queryDate);
	if (isNaN(d.getTime())) {
		d = new Date(new Date().toISOString().split('T')[0]);
	}
	hours = parseInt(hours);
	minutes = parseInt(minutes);
	if (!isNaN(hours)) d.setHours(hours);
	if (!isNaN(minutes)) d.setMinutes(minutes);
	return d.toISOString();
};

HTMLElementQuery.filters.toTime = function(val) {
	if (!val) return val;
	return HTMLElementQuery.filters.parseDate(val).toISOString().split('T').pop().split('.').shift();
};

HTMLElementQuery.filters.toDate = function(val, what, unit) {
	if (!val) return val;

	var date = HTMLElementQuery.filters.parseDate(val).toISOString().split('T').shift();
	if (!unit) return date;
	var parts = date.split('-');
	if (unit == "year") date = parts[0];
	else if (unit == "month") date = parts[0] + "-" + parts[1];
	return date;
};

HTMLElementQuery.filters.formatDate = function(val, what, ...list) {
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

HTMLElementQuery.filters.byWeek = function(val, what, path) {
	// val is an array
	// path accessor to a property
	// unit is year/month/week/day
	var data = val;
	var comps = what.expr.clone().path;
	var head;
	while (comps.length) {
		if (typeof data == "object" && data.length) {
			break;
		}
		head = comps.shift();
		data = data[head];
		if (data == null) break;
	}
	if (!Array.isArray(data)) {
		console.warn("Cannot filter groupBy with a value that is not an array");
	}

	var weeks = {};
	var arr = [];
	var aday = 1000 * 60 * 60 * 24;
	var curWeek;
	data.forEach(function(item) {
		var time = (new Date(what.expr.get(item, path))).getTime();
		if (isNaN(time)) {
			console.warn("byWeek filter cannot find a valid date at", path, "in", item);
			return;
		}
		var d = new Date(Math.round(time / aday) * aday);
		var mon = new Date(d);
		mon.setDate(d.getDate() - (d.getDay() + 6) % 7);
		var sun = new Date(mon);
		sun.setDate(mon.getDate() + 6);
		var h = mon.getTime().toString();
		var week = weeks[h];
		if (!week) {
			week = weeks[h] = {
				start: mon.toISOString(),
				end: sun.toISOString(),
				list: []
			};
			arr.push(week);
		}
		week.list.push(item);
	});
	// mutate val on purpose
	while (val.length) val.pop();
	while (arr.length) val.push(arr.shift());
};

