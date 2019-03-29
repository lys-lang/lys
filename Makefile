build:
	rm -rf dist || true
	node_modules/.bin/tsc -p tsconfig.json
	node_modules/.bin/tsc -p tsconfig.test.json
	chmod +x dist/bin.js
	node dist/utils/packStdLib.js

GREP="."

just-test:
	node ./node_modules/mocha/bin/_mocha --require source-map-support/register --grep $(GREP)

test: | build just-test

ci-test: test

inspect: build
	node --inspect ./node_modules/mocha/bin/_mocha --require source-map-support/register

watch: build
	node_modules/.bin/tsc -p tsconfig.json --watch & node_modules/.bin/tsc -p tsconfig.test.json --watch

lint:
	node_modules/.bin/tslint -t msbuild src/**/*.ts

snapshot: export UPDATE_AST=true
snapshot: just-test

.PHONY: build test snapshot
