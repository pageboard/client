/**
 * Created by Serge Balykov (ua9msn@mail.ru) on 2/12/17.
 */

'use strict';

describe('Date suite', function(){

    let $input,
        plug;

    const format =  {
        hour12:  true,
        hour:    '2-digit',
        minute:  '2-digit',
        second:  '2-digit',
        weekday: 'long',
        year:    'numeric',
        month:   'long',
        day:     'numeric'
    };


    // Since I've got the problem with running tests both with karma and test runner,
    // due to the path and ajax loading of local files, I set the fixture as the string here.

    //jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

    beforeEach(function () {
        setFixtures('<input id="dt" type="text" />');
        plug = DateTimeEntry('#dt', {
            locale: 'ru',
            format:  format,
            minDate: new Date('01/01/2017 12:00:00 UTC'),
            maxDate: new Date('01/10/2017 00:00:00 UTC')
        });
        $input = $(plug.element);

    });

    it('date - in range', function(){
        const dt = new Date('01/05/2017 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( true );

    });

    it('date - less than limits', function(){
        const dt = new Date('01/01/2015 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

    it('date - bigger than limits', function(){
        const dt = new Date('01/01/2018 01:02:03 UTC');
        const result = plug._validate(dt);
        expect( result ).toEqual( false );

    });

});
