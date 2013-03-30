var chai = require('chai');

var Card = require('../Card.js').Card;

chai.should();

describe('Card', function() {
    describe('#equals()', function() {
        it('should return true if both cards are null', function() {
            Card.equals(null, null).should.be.true;
        })
        it('should return false if exactly one of the cards is null', function() {
            Card.equals(null, new Card(0,0,0,0)).should.be.false;
            Card.equals(new Card(0,0,0,0), null).should.be.false;
        })
    })
})