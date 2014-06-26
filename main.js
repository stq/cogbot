fs = require('fs');
vm = require('vm');
vm.runInThisContext(fs.readFileSync(__dirname+"/underscore-min.js"));

log = require('./server/log');
proxy = require('./server/proxy');
proxy.start();
require('./server/ui').init();