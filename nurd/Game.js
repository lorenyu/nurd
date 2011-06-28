var util = require('util'),
    proxy = require('../jsutil.js').proxy,
    Crypto = require('../jsutil.js').Crypto,
    Player = require('./Player.js').Player,
    Card = require('./Card.js').Card,
    Deck = require('./Deck.js'),
    ChatServer = require('../ChatServer.js').ChatServer;


var chatServer = new ChatServer();    
    
var Game = module.exports = function() {
    process.EventEmitter.call(this);
    this._deck = new Deck();
    this._playerTimeout = 20*1000; // shorter timeout (useful for testing/debugging)
    this._moreCardsRequestThreshold = 2/3; // minimum percentage of card requests required to deal more cards
    this._restartGameRequestThreshold = 2/3; // minimum percentage of restart game requests required to restart game
    this._endGameRequestThreshold = 2/3; // minimum percentage of end game requests required to end game
    
    this.id = Crypto.getRandomKey();
    this.cardsInPlay = [];
    this.players = [];
    
    this.startGame();
    setInterval(proxy(this._cleanupPlayers, this), Math.floor(this._playerTimeout / 2)); // TODO: cleanup players
    
    this.log = util.log;
};
util.inherits(Game, process.EventEmitter);

Game.prototype.onEvent = function(event) {
    var player,
        success;

    switch (event.type) {
    case 'joinGame':
        this.broadcastGameState();
        break;
    case 'registerPlayer':
        this.registerPlayer(event.player, event.registerId, event.secret);
        break;
    case 'selectCards':
        player = this.getPlayer(event.playerId);
        if (player) {
            success = player.selectCards(event.cards);
            this._sortPlayersByScore();
            if (success) {
                this.emit('message', { type: 'playerScored', player: player, cards: event.cards });
            } else {
                this.emit('message', { type: 'playerFailedSet', player: player, cards: event.cards });
            }
            this.broadcastGameState();
        }
        break;
    case 'startGame':
        player = this.getPlayer(event.playerId);
        if (player) {
            player.isRequestingGameRestart = true;
            if (this.numRestartGameRequests() >= this._restartGameRequestThreshold * this.players.length) {
                this.startGame();
            } else {
                this.broadcastGameState();
            }
        }
        break;
    case 'cancelRestartGameRequest':
        player = this.getPlayer(event.playerId);
        if (player) {
            player.isRequestingGameRestart = false;
            this.broadcastGameState();
        }
        break;
    case 'dealMoreCards':
        player = this.getPlayer(event.playerId);
        if (player) {
            player.isRequestingMoreCards = true;
            if (this.numMoreCardsRequests() >= this._moreCardsRequestThreshold * this.players.length) {
                this.dealMoreCards();
            } else {
                this.broadcastGameState();
            }
        }
        break;
    case 'cancelMoreCardsRequest':
        player = this.getPlayer(event.playerId);
        if (player) {
            player.isRequestingMoreCards = false;
            this.broadcastGameState();
        }
        break;
    case 'endGame':
        player = this.getPlayer(event.playerId);
        if (player) {
            player.isRequestingGameEnd = true;
            if (this.numEndGameRequests() >= this._endGameRequestThreshold * this.players.length) {
                this.endGame();
            } else {
                this.broadcastGameState();
            }
        }
        break;
    case 'cancelEndGameRequest':
        player = this.getPlayer(event.playerId);
        if (player) {
            player.isRequestingGameEnd = false;
            this.broadcastGameState();
        }
        break;
    case 'leave':
        this.removePlayer(event.playerId);
        this.broadcastGameState();
        break;
    case 'stay':
        player = this.getPlayer(event.playerId);
        if (player) {
            var now = (new Date()).getTime();
            player.lastSeen = now;
        }
        break;
    case 'changeName':
        player = this.getPlayer(event.playerId);
        if (player) {
            var name = event.name;
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
            player.name = name;
            this.broadcastGameState();
        }
        break;
    default:
        this.log('unknown command: ' + event.type);
        break;
    }
};

Game.prototype.getPlayer = function(playerId) {
    for (var i = 0, n = this.players.length; i < n; i += 1) {
        var player = this.players[i];
        if (player.getId() == playerId) {
            return player;
        }
    }
    return null;
};
    
Game.prototype.numMoreCardsRequests = function() {
    return this.players.reduce(function(count, player) {
        return count + (player.isRequestingMoreCards ? 1 : 0);
    }, 0);
};
Game.prototype.numEndGameRequests = function() {
    return this.players.reduce(function(count, player) {
        return count + (player.isRequestingGameEnd ? 1 : 0);
    }, 0);
};
Game.prototype.numRestartGameRequests = function() {
    return this.players.reduce(function(count, player) {
        return count + (player.isRequestingGameRestart ? 1 : 0);
    }, 0);
};
Game.prototype._sortPlayersByScore = function() {
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
    
Game.prototype._isValidSet = function(cards) {
    var i, j, card, total;
    if (cards.length != 3) {
        this.log('need 3 cards');
        return false;
    }
    if (cards[0] == cards[1]) { // if all three cards are the same (if the first two are the same and the last one is not then the later checks will fail anyways)
        return false;
    }
    for (i = 0; i < 3; i += 1) {
        card = cards[i];
        if (!this._isCardInPlay(card)) {
            this.log('card not in play');
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
            this.log('total not multiple of three');
            return false;
        }
    }
    return true;
};

Game.prototype._isCardInPlay = function(card) {
    for (var i = 0, n = this.cardsInPlay.length; i < n; i += 1) {
        if (Card.equals(this.cardsInPlay[i], card)) {
            return true;
        }
    }
    return false;
};

Game.prototype._cleanupPlayers = function() {
    /*
    this.log('cleaning up players');
    var now = (new Date()).getTime();
    var numPlayers = this.players.length;
    for (var i = 0; i < this.players.length; i += 1) {
        var player = this.players[i];
        if (player.lastSeen < now - playerTimeout) {
            this.log('removed player ' + i);
            this.players.splice(i, 1);
            i -= 1;
        }
    }
    if (numPlayers !== this.players.length) { // if a player left players, then notify other players
        EventEngine.fire('server:gameUpdated', this.gameState());
    }
    */
};
    
Game.prototype.gameState = function() {
    return {
        cardsInPlay : this.cardsInPlay,
        players : this.players,
        deckSize : deck.numCards(),
        numMoreCardsRequests : this.numMoreCardsRequests(),
        numRestartGameRequests : this.numRestartGameRequests(),
        numEndGameRequests : this.numEndGameRequests()
    };
};

Game.prototype.registerPlayer = function(player, registerId, secret) {
    // this.log('Game:registerPlayer: registerId=' + registerId + ', secret=' + secret);
    player.lastSeen = (new Date()).getTime();
    player.joinGame(this);

    var encPlayerId = secret + player.getId();
    this.emit('message', {
        type: 'playerRegistered',
        registerId: registerId,
        encPlayerId: encPlayerId,
        playerPublicId: player.publicId,
        playerTimeout: this._playerTimeout,
        name: player.name
    });
    this.broadcastGameState();
};

Game.prototype.addPlayer = function(player) {
    for (var i = 0, n = this.players.length; i < n; i += 1) {
        if (Player.equals(this.players[i], player)) {
            return false;
        }
    }
    this.players.push(player);
    player.on('message', proxy(this.onEvent, this));
    return true;
};

Game.prototype.removePlayer = function(playerId) {
    for (var i = 0, n = this.players.length; i < n; i += 1) {
        if (this.players[i].getId() == playerId) {
            this.log('removing player ' + playerId);
            this.players.splice(i, 1);
            return true;
        }
    }
    return false;
};

Game.prototype.processSet = function(cards) {
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

Game.prototype.startGame = function() {
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
    this.broadcastGameState();
};

Game.prototype.dealMoreCards = function() {
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
    this.broadcastGameState();
};
    
Game.prototype.endGame = function() {
    this._sortPlayersByScore();
    EventEngine.fire('server:gameEnded', {
        players: this.players
    });
};
    
Game.prototype.broadcastGameState = function() {
    this.emit('message', {
        type: 'gameUpdate',
        gameState: this.gameState()
    });
};
