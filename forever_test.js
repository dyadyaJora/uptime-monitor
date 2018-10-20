console.log('o1k');
var fs = require('fs');

fs.appendFileSync('test.txt', 'ok\n');

setTimeout(function () {}, 5000);