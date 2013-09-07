var express = require('express')
  , util = require('util')
  , _ = require('underscore')
  , jade_browser = require('jade-browser')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , mobileDetector = require('./middleware/mobileDetector')
  , EventEngineHttpServer = require('./EventEngineHttpServer').EventEngineHttpServer
  , Game = require('./GameServer.js').Game
  , ChatServer = require('./ChatServer.js').ChatServer
  , EventEngine = require('./EventEngine.js').EventEngine;

var log = util.puts;

var app = express()
  , eventEngine = new EventEngine()
  , eventServer = new EventEngineHttpServer(eventEngine)
  , server = http.createServer(app);

Game.create(eventEngine);
eventEngine.observe('client:game:new', function() {
  Game.create(eventEngine);
});

var chatServer = new ChatServer(eventEngine);

app.configure(function(){
  app.set('port', process.env.PORT || 8125);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  // app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(mobileDetector);
  app.use(app.router);
  app.use(require('less-middleware')({ src: __dirname + '/public' }));
  app.use(jade_browser('/js/jade-templates', '**', {
    root: __dirname + '/views',
    namespace: 'jadeTemplates'
  }));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/game', routes.masterGame);
app.get('/game/:gameId', routes.game);
app.get('/jsutil.js', routes.js.jsutil);
app.get('/EventEngine.js', routes.js.EventEngine);
app.get('/debug/game/:gameId', routes.admin.game);

app.locals({
  _: _
});

eventServer.listen(app);

server.listen(app.get('port'), function() {
  console.log('Server running at http://localhost:' + app.get('port'));
});