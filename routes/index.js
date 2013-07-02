var Game = require('../GameServer').Game;

var routes = module.exports = {
  js: require('./js'),
  admin: require('./admin'),
  index: function(req, res) {
    res.redirect(302, '/game/1');
    // res.render('index', {
    //   title: 'Tttrio - a fast real-time multiplayer pattern-matching game to hone your logical skills',
    //   description: 'Play Tttrio free now. Face off against friends, family, and strangers in a skill-based game of quick perception and pattern matching. Find trios of cards to score points and win.',
    //   games: Game.list()
    // });
  },
  masterGame: function(req, res) {
    res.sendfile('views/game.html');
  },
  game: function(req, res) {
    var game = Game.get(req.params.gameId);
    if (!game) {
      res.send('No game with id ' + req.params.gameId);
    }
    res.render('game', {
      title: 'Tttrio - a fast real-time multiplayer pattern-matching game to hone your logical skills',
      description: 'Play Tttrio free now. Face off against friends, family, and strangers in a skill-based game of quick perception and pattern matching. Find trios of cards to score points and win.',
      game: game,
      games: Game.list()
    });
  }
};