var Card = require('./Card.js').Card;

this.Deck = function() {

    this.cards = [];
    
    function init() {
        for (var shape = 0; shape < 3; shape += 1) {
            for (var color = 0; color < 3; color += 1) {
                for (var shading = 0; shading < 3; shading += 1) {
                    for (var number = 0; number < 3; number += 1) {
                        this.cards.push(new Card(shape, color, shading, number));
                    }
                }
            }
        }
        this.shuffle();
    }

    this.shuffle = function() {
        for (var i = 0, n = this.cards.length; i < n; i += 1) {
            var j = i + Math.floor(Math.random() * (n - i));
            var temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    };

    this.drawCard = function() {
        var numCards = this.cards.length,
            i;
        if (numCards > 0) {
            i = Math.floor(Math.random() * numCards);
            return this.cards.splice(i,1)[0];
        }
        return null;
    };

    this.drawSpecificCard = function(card) {
        for (var i = 0, n = this.cards.length; i < n; i += 1) {
            if (Card.equals(this.cards[i], card)) {
                return this.cards.splice(i,1)[0];
            }
        }
        return null;
    }

    this.isEmpty = function() {
        return this.cards.length === 0;
    };
    
    this.numCards = function() {
        return this.cards.length;
    };
    
    this.addCard = function(card) {
        this.cards.push(card);
    };

    init.apply(this, arguments);
};