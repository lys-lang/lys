build:
	rm -rf dist || true
	node_modules/.bin/tsc -p tsconfig.json
	node_modules/.bin/tsc -p tsconfig.test.json
	chmod +x dist/bin.js

test: build
	node ./node_modules/mocha/bin/_mocha --require source-map-support/register

ci-test: test

inspect: build
	node --inspect ./node_modules/mocha/bin/_mocha --require source-map-support/register

watch: build
	node_modules/.bin/tsc -p tsconfig.json --watch & node_modules/.bin/tsc -p tsconfig.test.json --watch

lint:
	node_modules/.bin/tslint -t msbuild src/**/*.ts

snapshot: export UPDATE_AST=true
snapshot: test

.PHONY: build test snapshot
