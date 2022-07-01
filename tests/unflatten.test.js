const assert = require('node:assert');
global.Pageboard = {};
require('../packages/write/ui/semafor');

suite('semafor', function () {
	this.timeout(require('node:inspector').url() === undefined ? 20000 : 0);

	test('unflatten', async function () {
		const m = new Map();
		m.set("action", undefined);
		m.set("action.method.more", null);
		m.set("redirection", null);
		m.set("redirection.url", null);
		m.set("redirection.parameters", null);
		m.set("test", false);
		m.set("obj.test", true);
		m.set("list.0.one", "one");
		m.set("list.0.two", "two");
		m.set("list.1.one", "oneone");
		const obj = Pageboard.Semafor.unflatten(m);
		assert.deepEqual(obj, {
			action: null,
			redirection: null,
			test: false,
			obj: { test: true },
			list: [{ one: 'one', two: 'two' }, { one: 'oneone' }]
		});
	});
});
