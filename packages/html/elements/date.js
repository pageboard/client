exports.datetime = {
	title: "Date Time",
	icon: '<i class="clock outline icon"></i>',
	inline: true,
	inplace: true,
	group: "inline nolink",
	properties: {
		datetime: {
			title: 'Date and time',
			type: 'string',
			format: 'date-time',
			nullable: true
		},
		timezone: {
			title: ' Time zone',
			type: 'string',
			pattern: /\w+\/\w+/.source,
			nullable: true
		},
		format: {
			title: 'Format',
			type: 'object',
			properties: {
				weekday: {
					title: 'Weekday',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'd',
							title: 'short'
						}, {
							const: 'day',
							title: 'long'
						}
					]
				},
				day: {
					title: 'Day of month',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'D',
							title: 'numeric'
						}, {
							const: 'DD',
							title: 'two-digits'
						}
					]
				},
				month: {
					title: 'Month',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'mon',
							title: 'short'
						}, {
							const: 'month',
							title: 'long'
						}, {
							const: 'M',
							title: 'numeric'
						}, {
							const: 'MM',
							title: 'two-digits'
						}
					]
				},
				year: {
					title: 'Year',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'Y',
							title: 'numeric'
						}, {
							const: 'YY',
							title: 'two-digits'
						}
					]
				},
				hour: {
					title: 'Hour',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'H',
							title: 'numeric'
						}, {
							const: 'HH',
							title: 'two-digits'
						}
					]
				},
				minute: {
					title: 'Minute',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'm',
							title: 'numeric'
						}, {
							const: 'mm',
							title: 'two-digits'
						}
					]
				},
				second: {
					title: 'Second',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 's',
							title: 'numeric'
						}, {
							const: 'ss',
							title: 'two-digits'
						}
					]
				},
				timeZoneName: {
					title: 'Timezone',
					anyOf: [
						{
							const: null,
							title: 'none'
						}, {
							const: 'tz',
							title: 'offset'
						}, {
							const: 'timezone',
							title: 'short'
						}
					]
				}
			}
		}
	},
	html: `<time datetime="[datetime|now|isoDate]">[datetime|now|formatDate:[format|values|join:%3A]]</time>`
};
