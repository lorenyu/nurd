var chai = require('chai'),
    expect = chai.expect,
    _ = require('underscore');

var SetCalculator = require('../SetCalculator.js'),
    Card = require('../Card.js').Card;

chai.should();

describe('SetCalculator', function() {
    describe('#isValidSet()', function() {
        it('should return true for valid sets', function() {
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), new Card(2,2,2,2)]).should.be.true;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,0,0,0), new Card(2,0,0,0)]).should.be.true;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(0,1,0,0), new Card(0,2,0,0)]).should.be.true;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(0,0,1,0), new Card(0,0,2,0)]).should.be.true;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(0,0,0,1), new Card(0,0,0,2)]).should.be.true;
            SetCalculator.isValidSet([new Card(0,1,2,0), new Card(1,2,0,1), new Card(2,0,1,2)]).should.be.true;
        });
        it('should return false for invalid sets', function() {
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), new Card(1,2,2,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), new Card(2,1,2,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), new Card(2,2,1,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), new Card(2,2,2,1)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,1,2,0), new Card(1,2,0,1), new Card(0,0,1,2)]).should.be.false;
        });
        it('should return false if all three cards are the same', function() {
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(0,0,0,0), new Card(0,0,0,0)]).should.be.false;
        });
        it('should return false if set does not contain exactly three cards', function() {
            SetCalculator.isValidSet([]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), new Card(2,2,2,2), new Card(0,1,1,2)]).should.be.false;
        });
        it('should return false if any of the cards is null', function() {
            SetCalculator.isValidSet([null, new Card(1,1,1,1), new Card(2,2,2,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), null, new Card(2,2,2,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), null]).should.be.false;
        });
        it('should return false if any of the cards is not an instance of Card', function() {
            SetCalculator.isValidSet(['card', new Card(1,1,1,1), new Card(2,2,2,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), 'card', new Card(2,2,2,2)]).should.be.false;
            SetCalculator.isValidSet([new Card(0,0,0,0), new Card(1,1,1,1), 'card']).should.be.false;
        });
    });
    describe('#getCardNeededToCompleteSet()', function() {
        it('should return the third card needed to complete the set', function() {
            Card.equals(new Card(2,2,2,2), SetCalculator.getCardNeededToCompleteSet([new Card(0,0,0,0), new Card(1,1,1,1)])).should.be.true;
            Card.equals(new Card(2,0,0,0), SetCalculator.getCardNeededToCompleteSet([new Card(0,0,0,0), new Card(1,0,0,0)])).should.be.true;
            Card.equals(new Card(0,2,0,0), SetCalculator.getCardNeededToCompleteSet([new Card(0,0,0,0), new Card(0,1,0,0)])).should.be.true;
            Card.equals(new Card(0,0,2,0), SetCalculator.getCardNeededToCompleteSet([new Card(0,0,0,0), new Card(0,0,1,0)])).should.be.true;
            Card.equals(new Card(0,0,0,2), SetCalculator.getCardNeededToCompleteSet([new Card(0,0,0,0), new Card(0,0,0,1)])).should.be.true;
            Card.equals(new Card(2,0,1,2), SetCalculator.getCardNeededToCompleteSet([new Card(0,1,2,0), new Card(1,2,0,1)])).should.be.true;
        });
        it('should throw an error if cards does not contain exactly two cards', function() {
            _.partial(SetCalculator.getCardNeededToCompleteSet, []).should.throw(Error);
            _.partial(SetCalculator.getCardNeededToCompleteSet, [new Card(0,0,0,0)]).should.throw(Error);
            _.partial(SetCalculator.getCardNeededToCompleteSet, [[new Card(0,0,0,0), new Card(1,1,1,1), new Card(2,2,2,2)]]).should.throw(Error);
        });
        it('should throw an error if any of the cards is null', function() {
            _.partial(SetCalculator.getCardNeededToCompleteSet, [null, new Card(1,1,1,1)]).should.throw(Error);
            _.partial(SetCalculator.getCardNeededToCompleteSet, [new Card(0,0,0,0), null]).should.throw(Error);
        });
        it('should throw an error if any of the cards is not an instance of Card', function() {
            _.partial(SetCalculator.getCardNeededToCompleteSet, ['card', new Card(1,1,1,1)]).should.throw(Error);
            _.partial(SetCalculator.getCardNeededToCompleteSet, [new Card(0,0,0,0), 'card']).should.throw(Error);
        });
    });
});