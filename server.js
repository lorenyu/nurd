var util = require('util');
var http = require('http');
var EventEngineHttpServer = require('./EventEngineHttpServer').EventEngineHttpServer;

var log = util.puts;

var EventEngine = require('./EventEngine.js').EventEngine;
EventEngine.observeAll(function(event) {
    log('server.js:received event:' + JSON.stringify(event));
});

var server = new EventEngineHttpServer();

server.listen(8125, "127.0.0.1");
//util.puts('Server running at http://localhost:8080/');