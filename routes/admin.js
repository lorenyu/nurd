var Game = require('../GameServer').Game;

exports.game = function(req, res) {
  var game = Game.get(req.params.gameId);
  res.json({
    id: game.id,
    cardsInPlay: game.cardsInPlay,
    players: game.players,
    startTime: game.startTime,
    deck: game.getDeck()
  });
};