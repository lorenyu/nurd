var Game = require('../GameServer').Game;

exports.game = function(req, res) {
  res.json(Game.get(req.params.gameId));
};