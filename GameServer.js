var util = require('util');
var http = require('http');
var EventEngine = require('./EventEngine.js').EventEngine;

var Deck = require('./Deck.js').Deck;

var log = util.puts;

function proxy(fn, object) {
    return function() {
        fn.apply(object, arguments);
    }
}

this.Game = function() {

    var deck = new Deck();
    this.cardsInPlay = [];
    this.players = [];

    function init() {
        EventEngine.observe('client:startGame', proxy(this.startGame, this));
        EventEngine.observe('client:dealMoreCards', proxy(this.dealMoreCards, this));
        EventEngine.observe('client:selectCards', proxy(this.selectCards, this));
        //EventEngine.observe('client:endGame', proxy(this.endGame, this));
    }

    function isValidSet(cards) {
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
            if (!this.isCardInPlay(card)) {
                log('card not in play');
                return false;
            }
        }
        for (i = 0; i < 4; i += 1) {
            total = 0;
            for (j = 0; j < 3; j += 1) {
                card = cards[j];
                total += card.getAttribute[i];
            }
            if (total % 3 !== 0) {
                log('total not multiple of three');
                return false;
            }
        }
        return true;
    }

    function isCardInPlay(card) {
        for (var i = 0, n = this.cardsInPlay.length; i < n; i += 1) {
            if (Card.equals(this.cardsInPlay[i], card)) {
                return true;
            }
        }
        return false;
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

    this.processSet = function(cards) {
        if (!isValidSet(cards)) {
            return false;
        }

        if (!deck.isEmpty()) {
            for (var i = 0, n = cards.length; i < n; i += 1) {
                var card = cards[i];
                for (var j = 0, m = this.cardsInPlay.length; j < m; j += 1) {
                    if (Card.equals(this.cardsInPlay[j], card)) {
                        break;
                    }
                }
                this.cardsInPlay[j] = deck.drawCard();
            }
        }
        EventEngine.fire('server:gameUpdated', this);
        return true;
    }

    this.startGame = function() {
        for (var i = 0; i < 12; i += 1) {
            this.cardsInPlay.push(deck.drawCard());
        }
        EventEngine.fire('server:gameUpdated', this);
    }

    this.dealMoreCards = function() {
        for (var i = 0; i < 3; i += 1) {
            this.cardsInPlay.push(deck.drawCard());
        }
        EventEngine.fire('server:gameUpdated', this);
    }

    init.apply(this, arguments);
};
