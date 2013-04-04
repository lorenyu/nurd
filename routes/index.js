var Game = require('../GameServer').Game;

var routes = module.exports = {
  js: require('./js'),
  index: function(req, res) {
    res.render('index', {
      title: 'Tttrio - a fast real-time multiplayer pattern-matching game to hone your logical skills',
      description: 'Play Tttrio free now. Face off against friends, family, and strangers in a skill-based game of quick perception and pattern matching. Find trios of cards to score points and win.'
    });
  },
  masterGame: function(req, res) {
    res.sendfile('views/game.html');
  },
  game: function(req, res) {
    res.render('game', {
      title: 'Tttrio - a fast real-time multiplayer pattern-matching game to hone your logical skills',
      description: 'Play Tttrio free now. Face off against friends, family, and strangers in a skill-based game of quick perception and pattern matching. Find trios of cards to score points and win.',
      game: Game.get(req.params.gameId)
    });
  }
};