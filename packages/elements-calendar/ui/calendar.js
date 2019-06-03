Page.ready(function(state) {
	var filters = state.scope.$filters;
	filters.formatDate = function(val, what, ...list) {
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
			default:
				if (/\w+\/\w+/.test(tok)) p.timeZone = tok;
				else console.warn("Unrecognized date format option", tok);
				break;
			}
		});
		var lang = document.documentElement.lang || window.navigator.language;
		var str;
		try {
			str = d.toLocaleString(lang, p);
		} catch(err) {
			if (p.timeZone && p.timeZone != "UTC") {
				p.timeZone = "UTC";
				str = d.toLocaleString(lang, p) + " UTC";
			} else {
				throw err;
			}
		}
		return str;
	};

	filters.byWeek = function(val, what, datapath) {
		// val is an array
		// path accessor to a property
		// unit is year/month/week/day
		var path = what.expr.clone().path;
		var data = (path[0] && path[0].startsWith('$')) ? what.scope.data : what.data;
		var head;
		while (path.length) {
			if (typeof data == "object" && data.length) {
				break;
			}
			head = path.shift();
			data = data[head];
			if (data == null) break;
		}
		if (!Array.isArray(data)) {
			return;
		}

		var weeks = {};
		var arr = [];
		var aday = 1000 * 60 * 60 * 24;
		data.forEach(function(item) {
			var time = (new Date(what.expr.get(item, datapath))).getTime();
			if (isNaN(time)) {
				console.warn("byWeek filter cannot find a valid date at", datapath, "in", item);
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
		while (data.length) data.pop();
		while (arr.length) data.push(arr.shift());
	};
});

