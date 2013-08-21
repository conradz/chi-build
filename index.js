/*jshint node: true */

var browserify = require('browserify'),
    Runner = require('sauce-tap-runner'),
    serveScript = require('serve-script'),
    async = require('async'),
    http = require('http'),
    browsers = require('./browsers'),
    jshintOptions = require('./jshint'),
    jshint = require('build-jshint');

module.exports = {
    test: test,
    lint: lint,
    serve: serve
};

function defaultCallback(err) {
    if (err) {
        throw err;
    }
}

function bundleScript(callback) {
    var bundle = browserify()
        .add('./test.js')
        .bundle();
    
    callback(null, bundle);
}

function outputTestResults(browser, results) {
    if (!results.ok) {
        console.error(
            'Browser', browser.name,
            'failed', results.fail.length, 'test(s).');
    } else {
        console.log('Browser', browser.name, 'passed all tests!');
    }

    results.fail.forEach(function(t) {
        console.error('Test #' + t.number + ':', t.name, 'failed.');
    });

    results.errors.forEach(function(e) {
        console.error('TAP parsing error:', e.message);
    });
}

function test(callback) {
    callback = callback || defaultCallback;

    var sauceUser = process.env.SAUCE_USER,
        sauceKey = process.env.SAUCE_KEY;

    if (!sauceUser || !sauceKey) {
        return callback(new Error('SAUCE_USER and SAUCE_USER must be set'));
    }

    var runner = new Runner(sauceUser, sauceKey),
        failed = 0;
    async.eachSeries(browsers, run, complete);

    function run(browser, callback) {
        console.log('Testing browser', browser.name + '...');
        runner.run(bundleScript, browser, function(err, results) {
            if (err) {
                return callback(err);
            }

            outputTestResults(browser, results);
            if (!results.ok) {
                failed++;
            }

            callback();
        });
    }

    function complete(err) {
        runner.close(function() {
            if (!err && failed !== 0) {
                err = new Error(failed + ' browser(s) failed');
            }

            callback(err);
        });
    }
}

function lint(callback) {
    callback = callback || defaultCallback;

    var files = ['*.js', 'bin/*', 'lib/*', 'example/*'];
    jshint(files, jshintOptions, function(err, failed) {
        if (!err && failed) {
            err = new Error('JSHint failed');
        }

        callback(err);
    });
}

function serve(options, callback) {
    options = options || {};
    callback = callback || defaultCallback;

    var app = serveScript({ src: bundleScript }),
        port = options.port || 8000;

    http.createServer(app).listen(port, function(err) {
        if (err) {
            return callback(err);
        }

        console.log('Listening on port', port);
        callback();
    });
}