# chi-build

[![Build Status](https://travis-ci.org/conradz/chi-build.png?branch=master)](https://travis-ci.org/conradz/chi-build)
[![Dependency Status](https://gemnasium.com/conradz/chi-build.png)](https://gemnasium.com/conradz/chi-build)


Custom build tool for the `chi-` packages.

This tool is custom-made for packages such as
[chi-create](https://github.com/conradz/chi-create). It is not intended to be a
general-purpose build utility.

## Tests

Tests must be written in the `test.js` file in the working directory. The file
will be automatically bundled by
[browserify](https://github.com/substack/node-browserify).

### Automated Tests

Run automated tests with the `chi-build test` command. This runs the tests with
[sauce-tap-runner](https://github.com/conradz/sauce-tap-runner). It will run the
tests in browsers listed in the `browsers.json` file in this repository. The
tests will be run by browsers in [Sauce Labs](https://saucelabs.com/). The
`SAUCE_USER` and `SAUCE_KEY` environment variables must be set to your Sauce
username and key, respectively.

### Local Tests

Serve tests locally with the `chi-build serve` command. This will bundle and
serve the tests in the same way as the automated tests. The output of the tests
will be displayed directly on the browser page. Use the `--port` option to
determine the port that it will listen on (default 8000). Just refresh the page
to re-bundle and re-run the tests.
