/*var util = require('util');
var http = require('http');
var EventEngineHttpServer = require('./EventEngineHttpServer').EventEngineHttpServer;

var log = util.puts;

var EventEngine = require('./EventEngine.js').EventEngine;
EventEngine.observeAll(function(event) {
    log('server.js:received event:' + JSON.stringify(event));
});

var server = new EventEngineHttpServer();
*/

var http = require('http');
http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
}).listen(8124, "127.0.0.1");


//server.listen(8080, "127.0.0.1");
//util.puts('Server running at http://localhost:8080/');