var util = require('util'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    jade = require('jade'),
    Game = require('./nurd/Game.js'),
    Player = require('./nurd/Player.js').Player;
    
var server,
    socket,
    PORT = process.env.C9_PORT,
    HOST = '0.0.0.0';

var log = util.puts;

// change directory to location of server.js (i.e. this file)
var serverDir = path.dirname(process.argv[1]);
process.chdir(serverDir);

var express = require('express');
var app = express.createServer();


var placeholder = require('./helpers/placeholder.js');
jade.filters.placeholder = placeholder.filter;
app.helpers({
    placeholder: placeholder.helper
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
    var game = games[req.params.gameid];
    if (!game) {
        // create game
        //game = games[req.params.gameid] = new Game();
    }
    res.sendfile('public/game.html');
});

app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
app.use(express.static(__dirname + '/public'));

app.listen(PORT, HOST);

var game = new Game();
var io = io.listen(app, {
    transports: ['flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling']
});
var nurdSocket = io; //io.of('/nurd');
nurdSocket.sockets.on('connection', function(client){
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
