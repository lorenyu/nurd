var util = require('util');
var http = require('http');
var EventEngine = require('./EventEngine.js').EventEngine;
var proxy = require('./jsutil.js').proxy;

var Player = require('./Player.js').Player;
var Card = require('./Card.js').Card;
var Deck = require('./Deck.js').Deck;
var ChatServer = require('./ChatServer.js').ChatServer;

var log = util.puts;

this.Game = function() {

    var deck = new Deck();
    this.cardsInPlay = [];
    this.players = [];

    //var playerTimeout = 15*60*1000; // 15 minutes
    var playerTimeout = 20*1000, // shorter timeout (useful for testing/debugging)
        moreCardsRequestThreshold = 2/3, // minimum percentage of card requests required to deal more cards
        restartGameRequestThreshold = 2/3, // minimum percentage of restart game requests required to restart game
        endGameRequestThreshold = 2/3; // minimum percentage of end game requests required to end game

    log('creating chat server');
    var chatServer = new ChatServer();

    function init() {

        EventEngine.observeAll(proxy(this.onEvent, this));

/*
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
        EventEngine.observe('client:changeName', proxy(function(event) {
            
        }, this));
*/


        this.startGame();
        setInterval(proxy(this._cleanupPlayers, this), Math.floor(playerTimeout / 2)); // TODO: cleanup players
    }

    this.onEvent = function(event) {
        if (event.name.indexOf('client:') !== 0) {
            return;
        }
        
        var player,
            success;

        switch (event.name) {
        case 'client:registerPlayer':
            this.registerPlayer(event.data.registerId, event.data.secret, event.data.name);
            break;
        case 'client:selectCards':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                success = player.selectCards(event.data.cards);
                this._sortPlayersByScore();
                if (success) {
                    EventEngine.fire('server:playerScored', { player: player, cards: event.data.cards });
                } else {
                    EventEngine.fire('server:playerFailedSet', { player: player, cards: event.data.cards });
                }
                EventEngine.fire('server:gameUpdated', this.gameState());
            }
            break;
        case 'client:startGame':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                player.isRequestingGameRestart = true;
                if (this.numRestartGameRequests() >= restartGameRequestThreshold * this.players.length) {
                    this.startGame();
                } else {
                    this.broadcastGameState();
                }
            }
            break;
        case 'client:cancelRestartGameRequest':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                player.isRequestingGameRestart = false;
                this.broadcastGameState();
            }
            break;
        case 'client:dealMoreCards':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                player.isRequestingMoreCards = true;
                if (this.numMoreCardsRequests() >= moreCardsRequestThreshold * this.players.length) {
                    this.dealMoreCards();
                } else {
                    this.broadcastGameState();
                }
            }
            break;
        case 'client:cancelMoreCardsRequest':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                player.isRequestingMoreCards = false;
                this.broadcastGameState();
            }
            break;
        case 'client:endGame':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                player.isRequestingGameEnd = true;
                if (this.numEndGameRequests() >= endGameRequestThreshold * this.players.length) {
                    this.endGame();
                } else {
                    this.broadcastGameState();
                }
            }
            break;
        case 'client:cancelEndGameRequest':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                player.isRequestingGameEnd = false;
                this.broadcastGameState();
            }
            break;
        case 'client:leave':
            this.removePlayer(event.data.playerId);
            EventEngine.fire('server:gameUpdated', this.gameState());
            break;
        case 'client:stay':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                var now = (new Date()).getTime();
                player.lastSeen = now;
            }
            break;
        case 'client:changeName':
            player = this.getPlayer(event.data.playerId);
            if (player) {
                var name = event.data.name;
                var regex = /^[\w. ]+$/i; // matches any string of alphanumeric or underscore characters

                if (typeof(name) !== 'string') {
                    break;
                }
                if (!name) {
                    break;
                }
                if (!regex.test(name)) {
                    break;
                }
                var prevName = player.name;
                player.name = name;
                
                EventEngine.fire('server:playerNameChanged', {
                    playerId : player.publicId,
                    prevName : prevName,
                    name : name
                });
                EventEngine.fire('server:gameUpdated', this.gameState());
            }
            break;
        default:
            log('unknown command: ' + event.name);
            break;
        }
    };

    this.getPlayer = function(playerId) {
        for (var i = 0, n = this.players.length; i < n; i += 1) {
            var player = this.players[i];
            if (player.getId() == playerId) {
                return player;
            }
        }
        return null;
    };
    
    this.numMoreCardsRequests = function() {
        return this.players.reduce(function(count, player) {
            return count + (player.isRequestingMoreCards ? 1 : 0);
        }, 0);
    };
    this.numEndGameRequests = function() {
        return this.players.reduce(function(count, player) {
            return count + (player.isRequestingGameEnd ? 1 : 0);
        }, 0);
    };
    this.numRestartGameRequests = function() {
        return this.players.reduce(function(count, player) {
            return count + (player.isRequestingGameRestart ? 1 : 0);
        }, 0);
    };
    this._sortPlayersByScore = function() {
        this.players.sort(function(a, b) {
            if (a.score > b.score) {
                return -1;
            } else if (a.score < b.score) {
                return 1;
            } else {
                return 0;
            }
        });
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
    };

    this._isCardInPlay = function(card) {
        for (var i = 0, n = this.cardsInPlay.length; i < n; i += 1) {
            if (Card.equals(this.cardsInPlay[i], card)) {
                return true;
            }
        }
        return false;
    };

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
            EventEngine.fire('server:gameUpdated', this.gameState());
        }
    };
    
    this.gameState = function() {
        return {
            cardsInPlay : this.cardsInPlay,
            players : this.players,
            deckSize : deck.numCards(),
            numMoreCardsRequests : this.numMoreCardsRequests(),
            numRestartGameRequests : this.numRestartGameRequests(),
            numEndGameRequests : this.numEndGameRequests()
        };
    };

    this.registerPlayer = function(registerId, secret, name) {
        log('Game:registerPlayer: registerId=' + registerId + ', secret=' + secret);
        var player = new Player();
        player.lastSeen = (new Date()).getTime();
        player.joinGame(this);
        player.name = name || player.name;

        var encPlayerId = secret + player.getId();
        EventEngine.fire('server:playerRegistered', {
            registerId: registerId,
            encPlayerId: encPlayerId,
            playerPublicId: player.publicId,
            playerTimeout: playerTimeout,
            name: player.name
        });
        EventEngine.fire('server:gameUpdated', this.gameState());
    };

    this.addPlayer = function(player) {
        for (var i = 0, n = this.players.length; i < n; i += 1) {
            if (Player.equals(this.players[i], player)) {
                return false;
            }
        }
        this.players.push(player);
        return true;
    };

    this.removePlayer = function(playerId) {
        for (var i = 0, n = this.players.length; i < n; i += 1) {
            if (this.players[i].getId() == playerId) {
                log('removing player ' + playerId);
                this.players.splice(i, 1);
                return true;
            }
        }
        return false;
    };

    this.processSet = function(cards) {
        if (!this._isValidSet(cards)) {
            return false;
        }

        for (var i = 0, n = cards.length; i < n; i += 1) {
            var card = cards[i];
            for (var j = 0, m = this.cardsInPlay.length; j < m; j += 1) {
                if (Card.equals(this.cardsInPlay[j], card)) {
                    if (this.cardsInPlay.length <= 12 && !deck.isEmpty()) { // replace the card if there are fewer than 12 cards and deck is not empty
                        this.cardsInPlay[j] = deck.drawCard();
                    } else { // if there are more than 12 cards in play or no cards left just remove the card
                        this.cardsInPlay.splice(j, 1);
                    }
                    break;
                }
            }
        }
        return true;
    };

    this.startGame = function() {
        deck = new Deck();
        this.cardsInPlay = [];
        
        var i;

        for (i = 0; i < 12; i += 1) {
            this.cardsInPlay.push(deck.drawCard());
        }
        for (i = 0, n = this.players.length; i < n; i += 1) {
            var player = this.players[i];
            player.score = 0;
            player.numSets = 0;
            player.numFalseSets = 0;
            player.isRequestingMoreCards = false;
            player.isRequestingGameEnd = false;
            player.isRequestingGameRestart = false;
        }
        EventEngine.fire('server:gameUpdated', this.gameState());
    };

    this.dealMoreCards = function() {
        var i, player, n;
        for (i = 0; i < 3; i += 1) {
            if (!deck.isEmpty()) {
                this.cardsInPlay.push(deck.drawCard());
            }
        }
        for (i = 0, n = this.players.length; i < n; i++) {
            player = this.players[i];
            player.isRequestingMoreCards = false;
        }
        EventEngine.fire('server:gameUpdated', this.gameState());
    };
    
    this.endGame = function() {
        this._sortPlayersByScore();
        EventEngine.fire('server:gameEnded', {
            players: this.players
        });
    };
    
    this.broadcastGameState = function() {
        EventEngine.fire('server:gameUpdated', this.gameState());
    };

    init.apply(this, arguments);
};
