
BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

prepublish: public/pageboard/throttle.js public/pageboard/pretty-bytes.js

public/pageboard/throttle.js: node_modules/throttleit/index.js
	$(BROWSERIFY) --standalone Throttle --outfile $@ $<

public/pageboard/pretty-bytes.js: node_modules/pretty-bytes/index.js
	$(BROWSERIFY) --standalone PrettyBytes --outfile $@ $<

