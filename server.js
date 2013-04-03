var express = require('express')
  , util = require('util')
  , _ = require('underscore')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , EventEngineHttpServer = require('./EventEngineHttpServer').EventEngineHttpServer
  , Game = require('./GameServer.js').Game
  , EventEngine = require('./EventEngine.js').EventEngine;

var log = util.puts;

var EventEngine = require('./EventEngine.js').EventEngine;
EventEngine.observeAll(function(event) {
    //log('server.js:received event:' + JSON.stringify(event));
});

var server = new EventEngineHttpServer();
var game = new Game();

server.listen(8125, '127.0.0.1');
util.puts('Server running at http://localhost:8125/');
