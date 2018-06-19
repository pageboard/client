BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

prettybytes := $(shell node -p "require('path').dirname(require.resolve('pretty-bytes'))")

build: lib lib/pretty-bytes.js

lib/pretty-bytes.js: ${prettybytes}/index.js
	$(BROWSERIFY) --standalone Pageboard.PrettyBytes --outfile $@ $<

lib:
	mkdir -p $@

