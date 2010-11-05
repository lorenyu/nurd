var proxy = require('./jsutil.js').proxy;
var Crypto = require('./jsutil.js').Crypto;
var EventEngine = require('./EventEngine.js').EventEngine;

var log = require('util').puts;

this.Player = function() {
    // Private class properties and functions

    return function() {
        var id = 0; // needs to be private so players can't pretend to be each other
        this.score = 0;
        this.numSets = 0;
        this.numFalseSets = 0;

        this.lastSeen = 0;

        var _game = null;
        
        function init() {
            id = Crypto.getRandomKey();
            log('Creating Player with id: ' + id);

            // TODO: create unregister player function to unregister these handlers so that we can delete the player
            EventEngine.observe('client:selectCards', proxy(function(event) {
                if (event.data.playerId == id) {
                    this.lastSeen = (new Date()).getTime();
                    this.selectCards(event.data.cards);
                    EventEngine.fire('server:gameUpdated', _game);
                }
            }, this));
            EventEngine.observe('client:startGame', proxy(function(event) {
                if (event.data.playerId == id) {
                    this.lastSeen = (new Date()).getTime();
                    _game.startGame();
                }
            }, this));
            EventEngine.observe('client:dealMoreCards', proxy(function(event) {
                if (event.data.playerId == id) {
                    this.lastSeen = (new Date()).getTime();
                    _game.dealMoreCards();
                }
            }, this));
        }

        this.getId = function() {
            return id;
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

        init.apply(this, arguments);
    }
}();

this.Player.equals = function(playerA, playerB) {
    return playerA.getId() === playerB.getId();
};