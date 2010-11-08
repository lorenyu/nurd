var util = require('util');
var http = require('http');
var path = require('path');
var EventEngineHttpServer = require('./EventEngineHttpServer').EventEngineHttpServer;
var Game = require('./GameServer.js').Game;

var log = util.puts;

// change directory to location of server.js (i.e. this file)
var serverDir = path.dirname(process.argv[1]);
process.chdir(serverDir);

var EventEngine = require('./EventEngine.js').EventEngine;
EventEngine.observeAll(function(event) {
    //log('server.js:received event:' + JSON.stringify(event));
});

var server = new EventEngineHttpServer();
var game = new Game();

server.listen(8125, "127.0.0.1");
util.puts('Server running at http://localhost:8125/');