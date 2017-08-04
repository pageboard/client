BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

throttleit := $(shell node -p "require('path').dirname(require.resolve('throttleit'))")
prettybytes := $(shell node -p "require('path').dirname(require.resolve('pretty-bytes'))")

build: write/lib write/lib/pretty-bytes.js write/lib/throttle.js

write/lib/throttle.js: ${throttleit}/index.js
	$(BROWSERIFY) --standalone Throttle --outfile $@ $<

write/lib/pretty-bytes.js: ${prettybytes}/index.js
	$(BROWSERIFY) --standalone PrettyBytes --outfile $@ $<

write/lib:
	mkdir -p $@

