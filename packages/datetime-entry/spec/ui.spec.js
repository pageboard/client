/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('UI suite', function () {

    let input,
        plug;

    const format = {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        document.body.innerHTML = '<input id="dt" type="text" />';
        input = document.body.firstElementChild;

        plug = new DateTimeEntry(input, {
            locale: 'en',
            format: format
        });

    });

    it('12 a.m. means midnight', function () {
        const dt = new Date('01/05/2017 00:00:00 UTC');
        plug.setOptions({
            format: {
                hour12: true,
                hour: '2-digit',
                minute: '2-digit',
            }
        });
        plug.setTime(dt);
        const val = input.value;
        expect(val).toEqual('12:00 AM');

    });

    it('zero unix time', function () {
        const dt = new Date(0);
        plug.setTime(dt);

        input.setSelectionRange(0, 0);

        let fakeEvent = {
            preventDefault: function () { },
            stopPropagation: function () { },
            target: input,
            type: 'keydown',
            which: 38 // key up
        };

        plug.handleEvent(fakeEvent);

        const d = plug.getTime();

        expect(d.getTime()).toEqual(86400000);


    });

});
