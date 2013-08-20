var test = require('tape');

test('beep', function(t) {
    t.ok(true, 'I am true');
    t.end();
});

test('boop', function(t) {
    t.notOk(false, 'I am not true');
    t.end();
});
