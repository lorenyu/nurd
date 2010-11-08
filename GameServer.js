var util = require('util');
var http = require('http');
var EventEngine = require('./EventEngine.js').EventEngine;
var proxy = require('./jsutil.js').proxy;

var Player = require('./Player.js').Player;
var Card = require('./Card.js').Card;
var Deck = require('./Deck.js').Deck;

var log = util.puts;

this.Game = function() {

    var deck = new Deck();
    this.cardsInPlay = [];
    this.players = [];

    var playerTimeout = 15*60*1000; // 15 minutes
    //var playerTimeout = 10*1000; // 10 seconds (for testing/debugging)

    function init() {
        EventEngine.observe('client:registerPlayer', proxy(function(event) {
            this.registerPlayer(event.data.registerId, event.data.secret);
        }, this));
        //EventEngine.observe('client:endGame', proxy(this.endGame, this));

        EventEngine.observe('client:selectCards', proxy(function(event) {
            var player = this.getPlayer(event.data.playerId);
            if (player) {
                player.selectCards(event.data.cards);
                EventEngine.fire('server:gameUpdated', this);
            }
        }, this));
        EventEngine.observe('client:startGame', proxy(function(event) {
            var player = this.getPlayer(event.data.playerId);
            if (player) {
                this.startGame();
            }
        }, this));
        EventEngine.observe('client:dealMoreCards', proxy(function(event) {
            var player = this.getPlayer(event.data.playerId);
            log('dealMoreCards');
            if (player) {
                this.dealMoreCards();
            }
        }, this));
        EventEngine.observe('client:leave', proxy(function(event) {
            this.removePlayer(event.data.playerId);
            EventEngine.fire('server:gameUpdated', this);
        }, this));
        EventEngine.observe('client:stay', proxy(function(event) {
            var player = this.getPlayer(event.data.playerId);
            if (player) {
                var now = (new Date()).getTime();
                player.lastSeen = now;
            }
        }, this));


        this.startGame();
        setInterval(proxy(this._cleanupPlayers, this), Math.floor(playerTimeout / 2)); // TODO: cleanup players
    }

    this.getPlayer = function(playerId) {
        for (var i = 0, n = this.players.length; i < n; i += 1) {
            var player = this.players[i];
            if (player.getId() == playerId) {
                return player;
            }
        }
        return null;
    };
    
    this._isValidSet = function(cards) {
        var i, j, card, total;
        if (cards.length != 3) {
            log('need 3 cards');
            return false;
        }
        if (cards[0] == cards[1]) { // if all three cards are the same (if the first two are the same and the last one is not then the later checks will fail anyways)
            return false;
        }
        for (i = 0; i < 3; i += 1) {
            card = cards[i];
            if (!this._isCardInPlay(card)) {
                log('card not in play');
                return false;
            }
        }
        for (i = 0; i < 4; i += 1) {
            total = 0;
            for (j = 0; j < 3; j += 1) {
                card = cards[j];
                total += card.attributes[i];
            }
            if (total % 3 !== 0) {
                log('total not multiple of three');
                return false;
            }
        }
        return true;
    }

    this._isCardInPlay = function(card) {
        for (var i = 0, n = this.cardsInPlay.length; i < n; i += 1) {
            if (Card.equals(this.cardsInPlay[i], card)) {
                return true;
            }
        }
        return false;
    }

    this._cleanupPlayers = function() {
        log('cleaning up players');
        var now = (new Date()).getTime();
        var numPlayers = this.players.length;
        for (var i = 0; i < this.players.length; i += 1) {
            var player = this.players[i];
            if (player.lastSeen < now - playerTimeout) {
                log('removed player ' + i);
                this.players.splice(i, 1);
                i -= 1;
            }
        }
        if (numPlayers !== this.players.length) { // if a player left players, then notify other players
            EventEngine.fire('server:gameUpdated', this);
        }
    }

    this.registerPlayer = function(registerId, secret) {
        log('Game:registerPlayer: registerId=' + registerId + ', secret=' + secret);
        var player = new Player();
        player.lastSeen = (new Date()).getTime();
        player.joinGame(this);

        var encPlayerId = secret + player.getId();
        EventEngine.fire('server:playerRegistered', {
            registerId: registerId,
            encPlayerId: encPlayerId,
            playerTimeout: playerTimeout
        });
        EventEngine.fire('server:gameUpdated', this);
    }

    this.addPlayer = function(player) {
        for (var i = 0, n = this.players.length; i < n; i += 1) {
            if (Player.equals(this.players[i], player)) {
                return false;
            }
        }
        this.players.push(player);
        return true;
    }

    this.removePlayer = function(playerId) {
        for (var i = 0, n = this.players.length; i < n; i += 1) {
            if (this.players[i].getId() == playerId) {
                this.players.splice(i, 1);
                return true;
            }
        }
        return false;
    }

    this.processSet = function(cards) {
        if (!this._isValidSet(cards)) {
            return false;
        }

        if (!deck.isEmpty()) {
            for (var i = 0, n = cards.length; i < n; i += 1) {
                var card = cards[i];
                for (var j = 0, m = this.cardsInPlay.length; j < m; j += 1) {
                    if (Card.equals(this.cardsInPlay[j], card)) {
                        if (this.cardsInPlay.length <= 12) { // replace the card if there are fewer than 12 cards
                            if (!deck.isEmpty()) {
                                this.cardsInPlay[j] = deck.drawCard();
                            }
                        } else { // if there are more than 12 cards in play just remove the card
                            this.cardsInPlay.splice(j, 1);
                        }
                        break;
                    }
                }
            }
        }
        return true;
    }

    this.startGame = function() {
        deck = new Deck();
        this.cardsInPlay = [];

        for (var i = 0; i < 12; i += 1) {
            this.cardsInPlay.push(deck.drawCard());
        }
        EventEngine.fire('server:gameUpdated', this);
    }

    this.dealMoreCards = function() {
        for (var i = 0; i < 3; i += 1) {
            if (!deck.isEmpty()) {
                this.cardsInPlay.push(deck.drawCard());
            }
        }
        EventEngine.fire('server:gameUpdated', this);
    }

    init.apply(this, arguments);
};
