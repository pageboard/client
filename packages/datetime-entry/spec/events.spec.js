/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('Events suite', function () {

    let input,
        plug;

    const format = {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };

    // Since I've got the problem with running tests both with karma and test runner,
    // due to the path and ajax loading of local files, I set the fixture as the string here.

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        setFixtures('<input id="dt" type="text" />');
        input = document.getElementById('dt');
        plug = new DateTimeEntry(input, {
            locale: 'ru',
            format: format,
            datetime: new Date(1487136412359) // 15 февраля 2017 05:26:52
        });
    });



    it('For 15 февраля 2017 05:26:52 click between ф and е should select 3, 10 ', function () {

        let fakeEvent = {
            preventDefault: function () { },
            stopPropagation: function () { },
            target: input,
            type: 'mousedown'
        };

        input.focus();

        input.setSelectionRange(4, 4);

        plug.handleEvent(fakeEvent);

        expect(input.selectionStart).toEqual(3);
        expect(input.selectionEnd).toEqual(10);


    });


    //  We can not trigger a real event via jasmine. so suppose it works without test :(
    // it('For CtrlA everything shoud be selected ', function(){
    // });



});
