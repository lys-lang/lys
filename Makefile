export PATH := $(shell npm bin):$(PATH)

build:
	rm -rf dist || true
	$(shell npm bin)/tsc -p tsconfig.json
	$(shell npm bin)/tsc -p test/tsconfig.json
	chmod +x dist/bin.js
	node dist/utils/packStdLib.js

GREP="."
TEST_FILE="test/*.spec.ts"

DEBUG_TYPES=0

just-test:
	DEBUG_TYPES=$(DEBUG_TYPES) \
		node ./node_modules/mocha/bin/_mocha --grep "$(GREP)" $(TEST_FILE)

test: | build just-test

xml-test:
	MOCHA_FILE=./test/TEST-RESULTS.xml \
		$(shell npm bin)/mocha --reporter mocha-junit-reporter

coverage:
	$(shell npm bin)/nyc ./node_modules/mocha/bin/_mocha

ci-test: | lint test e2e

azure-test: | lint xml-test e2e

inspect: build
	node --inspect ./node_modules/mocha/bin/_mocha --require source-map-support/register test/*.spec.js

watch: build
	$(shell npm bin)/tsc -p tsconfig.json --watch & $(shell npm bin)/tsc -p test/tsconfig.json --watch

lint:
	echo "true"
	# $(shell npm bin)/tslint src/**/*.ts --project tsconfig.json

e2e:
	$(MAKE) md-tests
	cd test/fixtures/cli/smoke && ../../../../dist/bin.js main.lys --test --debug --wast
	cd test/fixtures/cli/custom-lib && ../../../../dist/bin.js main.lys --test --debug --wast --lib lib.js

md-tests: build
	$(shell npm bin)/ts-node test/RunModulesFolder.ts

snapshot: export UPDATE_AST=true
snapshot: just-test

.PHONY: build test snapshot coverage dist
