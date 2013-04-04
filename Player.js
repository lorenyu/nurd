var proxy = require('./jsutil.js').proxy;
var Crypto = require('./jsutil.js').Crypto;

var log = require('util').puts;

this.Player = function() {
    // Private class properties and functions

    var numPlayersCreated = 0;

    return function() {
        var id = 0; // needs to be private so players can't pretend to be each other
        this.publicId = 0;
        this.score = 0;
        this.numSets = 0;
        this.numFalseSets = 0;
        this.name = null;
        this.color = 0;
        this.isRequestingMoreCards = false;
        this.isRequestingGameRestart = false;
        this.isRequestingGameEnd = false;

        this.lastSeen = 0;

        var _game = null;
        
        function init() {
            this.name = 'Player' + numPlayersCreated;
            this.publicId = numPlayersCreated;
            this.color = this.publicId % 15;
            numPlayersCreated += 1;

            id = Crypto.getRandomKey();
            log('Creating Player with id: ' + id);

            // TODO: create unregister player function to unregister these handlers so that we can delete the player
        }

        this.getId = function() {
            return id;
        };

        this.joinGame = function(game) {
            if (game.addPlayer(this)) {
                _game = game;
                return true;
            }
            return false;
        };

        this.selectCards = function(cards) {
            log('Player:selectCards(' + JSON.stringify(cards) + ')');
            if (!_game) {
                return false;
            }

            if (_game.processSet(cards)) {
                this.score += 1;
                this.numSets += 1;
                return true;
            } else {
                this.score -= 1;
                this.numFalseSets += 1;
                return false;
            }
        };

        init.apply(this, arguments);
    };
}();

this.Player.equals = function(playerA, playerB) {
    return playerA.getId() === playerB.getId();
};