var chai = require('chai'),
    expect = chai.expect;

var Deck = require('../Deck.js').Deck,
    Card = require('../Card.js').Card;

chai.should();

function newEmptyDeck() {
    var deck = new Deck();
    clearDeck(deck);
    return deck;
}

function clearDeck(deck) {
    while (!deck.isEmpty()) {
        deck.drawCard();
    }
    return deck;
}

describe('Deck', function() {
    describe('#Deck()', function() {
        // no unit tests for this
    })
    describe('#isEmpty()', function() {
        // no unit tests for this
    })
    describe('#numCards()', function() {
        it('should be 3^4 = 81 for a new deck', function() {
            new Deck().numCards().should.equal(Math.pow(3,4));
        })
    })
    describe('#addCard()', function() {
        it('should add the card to the deck', function() {
            var deck = newEmptyDeck();
            deck.addCard(new Card(0,0,0,0));
            Card.equals(deck.drawCard(), new Card(0,0,0,0)).should.be.true;
        })
    })
    describe('#drawCard()', function() {
        it('should return cards as long as the deck is not empty', function() {
            var deck = new Deck();
            while (!deck.isEmpty()) {
                var card = deck.drawCard();
                card.should.not.be.null;
                card.should.be.an.instanceof(Card);
            }
        })
        it('should return null if deck is empty', function() {
            var deck = newEmptyDeck();
            expect(deck.drawCard()).to.be.null;
        })
    })
    describe('#drawSpecificCard()', function() {
        it('should return null if the card is not in the deck', function() {
            var deck = newEmptyDeck();
            deck.addCard(new Card(0,0,0,0));
            expect(deck.drawSpecificCard(new Card(1,1,1,1))).to.be.null;
        })
        it('should return the requested card', function() {
            var deck = newEmptyDeck();
            deck.addCard(new Card(0,0,0,0));
            deck.addCard(new Card(1,1,1,1));
            deck.addCard(new Card(2,2,2,2));
            Card.equals(new Card(1,1,1,1), deck.drawSpecificCard(new Card(1,1,1,1))).should.be.true;
        })
        it('should remove the card from the deck', function() {
            var deck = newEmptyDeck();
            deck.addCard(new Card(0,0,0,0));
            deck.addCard(new Card(1,1,1,1));
            deck.addCard(new Card(2,2,2,2));
            Card.equals(new Card(1,1,1,1), deck.drawSpecificCard(new Card(1,1,1,1))).should.be.true;
            expect(deck.drawSpecificCard(new Card(1,1,1,1))).to.be.null;
        })
    })
    describe('#shuffle()', function() {
        it('should keep the same number of cards in the deck', function() {
            var deck = new Deck(),
                numCards = deck.numCards();
            deck.shuffle();
            deck.numCards().should.equal(numCards);
        })
        // no test for this
    })
})