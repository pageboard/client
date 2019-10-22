## DateTimeEntry
Enter formatted date and time without pickers.

This is the datetime-entry plugin from https://ua9msn.github.io/datetime,
without jquery support.

### New in version 3.3.0

format:timeZone can be passed:
```
format.timeZone = "Europe/Paris";
```
If this browser does not support this, is falls back to UTC (if useUTC is true) or none,
which is the system timezone.

### Usage

```
let inst = window.DateTimeEntry(selectorOrElement, options);
```

### What is inside
Instead of create huge data file with day names, month names, etc. I use Intl inside. 
So all languages supported by Intl, should be ready to use without any twitches.
 
### What's next
 
 * Add step option
 * Add ERA support
 * Increase test coverage
 * Optimize code

