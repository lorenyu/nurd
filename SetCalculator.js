var Card = require('./Card.js').Card;

module.exports = SetCalculator = {

    isValidSet: function(cards) {
        var i, j, card, total;
        if (cards.length !== 3) {
            return false;
        }
        // if any of the cards are null or aren't instance of Card
        for (i = 0; i < 3; i += 1) {
            if (!cards[i]) {
                return false;
            }
            if (!(cards[i] instanceof Card)) {
                return false;
            }
        }
        if (Card.equals(cards[0], cards[1])) { // if all three cards are the same (if the first two are the same and the last one is not then the later checks will fail anyways)
            return false;
        }
        for (i = 0; i < 4; i += 1) {
            total = 0;
            for (j = 0; j < 3; j += 1) {
                card = cards[j];
                total += card.attributes[i];
            }
            if (total % 3 !== 0) {
                return false;
            }
        }
        return true;
    },

    getCardNeededToCompleteSet: function(twoCards) {
        if (twoCards.length != 2) {
            throw new Error('twoCards needs to contain two cards');
        }
        // if any of the cards are null
        for (var i = 0; i < 2; i += 1) {
            if (!twoCards[i]) {
                throw new Error('cards in twoCards must not be null');
            }
            if (!(twoCards[i] instanceof Card)) {
                throw new Error('cards in twoCards must be instanceof Card');
            }
        }
        var resultCard = new Card(0,0,0,0),
            cardA = twoCards[0],
            cardB = twoCards[1];
        for (var i = 0; i < 4; i += 1) {
            if (cardA.attributes[i] == cardB.attributes[i]) {
                resultCard.attributes[i] = cardA.attributes[i];
            } else {
                resultCard.attributes[i] = 0 + 1 + 2 - cardA.attributes[i] - cardB.attributes[i];
            }
        }
        return resultCard;
    }
};