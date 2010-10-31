var proxy = require('./jsutil.js').proxy;
var Crypto = require('./jsutil.js').Crypto;
var EventEngine = require('./EventEngine.js').EventEngine;

var log = require('util').puts;

this.Player = function() {
    // Private class properties and functions

    return function() {
        this.id = 0;
        this.score = 0;
        this.numSets = 0;
        this.numFalseSets = 0;

        var _game = null;
        
        function init() {
            this.id = Crypto.getRandomKey();
            log('Creating Player with id: ' + this.id);
            EventEngine.observe('client:selectCards', proxy(function(event) {
                if (event.data.playerId == this.id) {
                    this.selectCards(event.data.cards);
                    EventEngine.fire('server:gameUpdated', _game);
                }
            }, this));
        }

        this.joinGame = function(game) {
            if (game.addPlayer(this)) {
                _game = game;
                return true;
            }
            return false;
        }

        this.selectCards = function(cards) {
            log('Player:selectCards(' + JSON.stringify(cards) + ')');
            if (!_game) {
                return;
            }

            if (_game.processSet(cards)) {
                this.score += 1;
                this.numSets += 1;
            } else {
                this.score -= 1;
                this.numFalseSets += 1;
            }
        }

        this.equals = function(player) {
            return this.id == player.id;
        }

        init.apply(this, arguments);
    }
}();
