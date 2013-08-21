var browserify = require('browserify'),
    Runner = require('sauce-tap-runner'),
    serveScript = require('serve-script'),
    async = require('async'),
    http = require('http'),
    browsers = require('./browsers');

module.exports = {
    test: test,
    serve: serve
};

function build(callback) {
    var bundle = browserify()
        .add('./test.js')
        .bundle();
    
    callback(null, bundle);
}

function printResults(browser, results) {
    if (!results.ok) {
        console.error(
            'Browser', browser.name,
            'failed', results.fail.length, 'test(s).');
    } else {
        console.log('Browser', browser.name, 'passed all tests!');
    }

    results.fail.forEach(function(t) {
        console.error('Test #' + t.number + ':', t.name, 'failed.')
    });

    results.errors.forEach(function(e) {
        console.error('TAP parsing error:', e.message);
    });
}

function test() {
    var sauceUser = process.env.SAUCE_USER,
        sauceKey = process.env.SAUCE_KEY;

    if (!sauceUser || !sauceKey) {
        console.error('SAUCE_USER and SAUCE_KEY must be set');
        process.exit(1);
    }

    var runner = new Runner(sauceUser, sauceKey),
        failed = 0;
    async.eachSeries(browsers, run, complete);

    function run(browser, callback) {
        console.log('Testing browser', browser.name + '...');
        runner.run(build, browser, function(err, results) {
            if (err) {
                return callback(err);
            }

            printResults(browser, results);
            if (!results.ok) {
                failed++;
            }

            callback();
        });
    }

    function complete(err) {
        runner.close(function() {
            if (err) {
                console.error('Error occurred in tests');
                console.error(err);
                process.exit(1);
            } else if (failed === 0) {
                console.log('All browsers passed!');
            } else {
                console.error(failed, 'browser(s) failed');
            }
        });
    }
}

function serve(options) {
    var app = serveScript({ src: build }),
        port = options.port || 8000;

    http.createServer(app).listen(port, function(err) {
        if (err) {
            throw err;
        }

        console.log('Listening on port', port);
    });
}