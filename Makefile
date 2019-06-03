build:
	rm -rf dist || true
	node_modules/.bin/tsc -p tsconfig.json
	node_modules/.bin/tsc -p test/tsconfig.json
	chmod +x dist/bin.js
	node dist/utils/packStdLib.js

GREP="."
TEST_FILE=*

DEBUG_TYPES=0

just-test:
	DEBUG_TYPES=$(DEBUG_TYPES) \
		node ./node_modules/mocha/bin/_mocha --grep "$(GREP)" "test/$(TEST_FILE).spec.ts"

test: | build just-test

xml-test:
	MOCHA_FILE=./test/TEST-RESULTS.xml \
		./node_modules/mocha/bin/_mocha --reporter mocha-junit-reporter

coverage:
	./node_modules/.bin/nyc ./node_modules/mocha/bin/_mocha

ci-test: | lint test e2e

azure-test: | lint xml-test e2e

inspect: build
	node --inspect ./node_modules/mocha/bin/_mocha --require source-map-support/register test/*.spec.js

watch: build
	node_modules/.bin/tsc -p tsconfig.json --watch & node_modules/.bin/tsc -p test/tsconfig.json --watch

lint:
	node_modules/.bin/tslint src/**/*.ts --project tsconfig.json

dist:
	npx oddish

e2e:
	$(MAKE) md-tests
	cd test/fixtures/cli/smoke && ../../../../dist/bin.js main.lys --test --debug --wast
	cd test/fixtures/cli/custom-lib && ../../../../dist/bin.js main.lys --test --debug --wast --lib lib.js

md-tests:
	./node_modules/.bin/ts-node test/RunModulesFolder.ts

snapshot: export UPDATE_AST=true
snapshot: just-test

.PHONY: build test snapshot coverage dist
