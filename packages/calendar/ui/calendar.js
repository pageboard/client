Page.ready(function(state) {
	var filters = state.scope.$filters;
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
			if (Number.isNaN(time)) {
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

