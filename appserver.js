var util = require('util'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    jade = require('jade'),
    express = require('express'),
    placeholder = require('placeholder'),
    Game = require('./nurd/Game.js'),
    Player = require('./nurd/Player.js').Player;

placeholder.install({
    express: express,
    jade: jade
});

jade.filters.temp = function(block, compiler, attrs) {
    return new jade.Compiler(block, compiler.options).compile();
};
    
var server,
    socket,
    PORT = process.env.C9_PORT,
    HOST = '0.0.0.0';

var log = util.puts;

// change directory to location of server.js (i.e. this file)
var serverDir = path.dirname(process.argv[1]);
process.chdir(serverDir);

var app = express.createServer();

app.dynamicHelpers({
    session: function(req, res) {
        return req.session;
    },
    params: function(req, res) {
        return req.params;
    }
});


var games = {};

app.set('view engine', 'jade');
app.get('/', function(req, res, next) {
    res.render('index');
});
app.get('/:page', function(req, res, next) {
    res.render(req.params.page);
});
app.get('/game/:gameid', function(req, res, next) {
    var game = games[req.params.gameid],
        socket = io.of('/nurd/game/' + req.params.gameid);
    console.log('creating socket for: /nurd/game/' + req.params.gameid);
    if (!game) {
        
        // create new game
        game = games[req.params.gameid] = new Game();
        socket.on('connection', function(client) {
            console.log('-------- connected ----------');
            var player = new Player();
            game.addPlayer(player);
            
            client.on('message', function(data){
                data.player = player;
                //console.log('received message on: ' + (new Date()).getTime() % 10000);
                //console.log(data);
                player.emit('message', data);
            });
            game.on('message', function(data) {
                //console.log('sending message on: ' + (new Date()).getTime() % 10000);
                client.json.send(data);
            });
            client.on('disconnect', function(){
                player.leaveGame();
            });
        });
        
    }
    //res.sendfile('public/game.html');
    res.render('game', {
        gameid: req.params.gameid
    });
});

app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
app.use(express['static'](__dirname + '/public'));

app.listen(PORT, HOST);

//var game = new Game();
io = io.listen(app, {
    transports: ['flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']
});
/*
var nurdSocket = io; //io.of('/nurd');
nurdSocket.sockets.on('connection', function(client) {
    console.log('----------client----------');
    //console.log(client);
    var player = new Player();
    game.addPlayer(player);
    
    console.log(client.namespace);
    
    client.on('message', function(data){
        data.player = player;
        //console.log('received message on: ' + (new Date()).getTime() % 10000);
        //console.log(data);
        player.emit('message', data);
    });
    game.on('message', function(data) {
        //console.log('sending message on: ' + (new Date()).getTime() % 10000);
        client.json.send(data);
    });
    client.on('disconnect', function(){
        player.leaveGame();
    });
}); 
*/
