REPORTER = dot

deps:
	sudo npm install

clean:
	sudo rm -rf node_modules *.log

test:
	./node_modules/.bin/mocha

.PHONY: test deps clean