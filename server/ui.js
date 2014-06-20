var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');
var settings = require('./settings.js');
var strategy = require('./strategy.js');
var log = require('./log.js');
var events = require('./events');

var components = {
    log: '',
    strategy: '',
    settings: ''
}
var template = _.template(fs.readFileSync(__dirname + '/ui/template.html').toString());

log.main("Starting CogBot admin panel injector service at localhost:3334");
app.listen(3334);

function handler(req, res) {
    res.writeHead(200);
    res.end();
}

function render() {
    if (socket) {
        socket.emit('update-view', template(components));
    }
}

events.on('strategy-update', function(html){ components.strategy = html; render();});
events.on('log-update', function(html){ components.log = html; render();});
events.on('settings-update', function(html){components.settings = html; render();});

var socket = null;
io.on('connection', function (_socket) {
    socket = _socket;
    events.emit('reconnect');
    socket.on('save-settings', function (data) {
        settings.update(data);
        log.main("Updated settings ", data);
    });
    socket.on('save-strategy', function (target) {
        strategy.scheduleSave(target);
        log.main("Strategy saving was scheduled, for ", target);
    });
    socket.on('hotfix', function (data) {
        log.main("Hotfixing strategy ", data);
        strategy.loadRecord("default");
    });
    log.debug("Connected");
});

io.on('disconnect', function() {
    log.debug("Disconnected");
});
