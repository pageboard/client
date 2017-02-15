
BROWSERIFY = $(shell node -p 'require.resolve("browserify/bin/cmd.js")')

prepublish: public/js/throttle.js

public/js/throttle.js: node_modules/throttleit/index.js
	$(BROWSERIFY) --standalone Throttle --outfile $@ $<
