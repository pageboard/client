# DateTimeEntry

Enter formatted date and time without pickers.

This is the datetime-entry plugin from [datetime without jquery](https://ua9msn.github.io/datetime).

## Options

```js
const defaults = {
 datetime: NaN,
 locale:   navigator.language,
 format:   {
  hour12:  false,
  hour:    '2-digit',
  minute:  '2-digit',
  second:  '2-digit',
  weekday: 'long',
  year:    'numeric',
  month:   'long',
  day:     'numeric',
  timeZone: 'Europe/Paris'
 },
 useUTC:   true,
 minDate:  NaN,
 maxDate:  NaN,
 minTime:  NaN,
 maxTime:  NaN,
 step: NaN, // in seconds
 onChange: t => {}
};
```

If this browser does not support this, is falls back to UTC (if useUTC is true) or none,
which is the system timezone.

## Usage

```js
let inst = new window.DateTimeEntry(selectorOrElement, options);
```

## What is inside

Instead of create huge data file with day names, month names, etc. I use Intl inside.
So all languages supported by Intl, should be ready to use without any twitches.

## What's next

* Add ERA support
* Increase test coverage
* Optimize code
