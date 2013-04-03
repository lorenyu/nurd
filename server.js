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

var app = express()
  , eventServer = new EventEngineHttpServer()
  , game = new Game()
  , server = http.createServer(app);

app.configure(function(){
  app.set('port', process.env.PORT || 8125);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  // app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/jsutil.js', routes.js.jsutil);
app.get('/EventEngine.js', routes.js.EventEngine);

eventServer.listen(app);

server.listen(app.get('port'), function() {
  console.log('Server running at http://localhost:' + app.get('port'));
});