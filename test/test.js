var chai = require('chai');

var Card = require('../Card.js').Card;

chai.should();

describe('Card', function() {
    describe('#equals()', function() {
        it('should return true if both cards are null', function() {
            Card.equals(null, null).should.be.true;
        })
    })
})