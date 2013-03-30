var chai = require('chai');

var Card = require('../Card.js').Card;

chai.should();

describe('Card', function() {
    describe('#Card()', function() {
        it('should throw an exception if any attribute is negative', function() {
            (function() { return new Card(-1,0,0,0); }).should.throw(Error);
            (function() { return new Card(0,-1,0,0); }).should.throw(Error);
            (function() { return new Card(0,0,-1,0); }).should.throw(Error);
            (function() { return new Card(0,0,0,-1); }).should.throw(Error);
        })
        it('should not throw an exception if the attributes are 0, 1, or 2', function() {
            for (var shape = 0; shape < 3; shape += 1) {
                for (var color = 0; color < 3; color += 1) {
                    for (var shading = 0; shading < 3; shading += 1) {
                        for (var number = 0; number < 3; number += 1) {
                            (function() { return new Card(shape, color, shading, number); }).should.not.throw(Error);
                        }
                    }
                }
            }
        })
    })
    describe('#equals()', function() {
        it('should return true if both cards are null', function() {
            Card.equals(null, null).should.be.true;
        })
        it('should return false if exactly one of the cards is null', function() {
            Card.equals(null, new Card(0,0,0,0)).should.be.false;
            Card.equals(new Card(0,0,0,0), null).should.be.false;
        })
        it('should return true if the cards match in all attributes', function() {
            for (var shape = 0; shape < 3; shape += 1) {
                for (var color = 0; color < 3; color += 1) {
                    for (var shading = 0; shading < 3; shading += 1) {
                        for (var number = 0; number < 3; number += 1) {
                            Card.equals(new Card(shape, color, shading, number), new Card(shape, color, shading, number)).should.be.true;
                        }
                    }
                }
            }
        })
        it('should return false if the cards do not match in all attributes', function() {
            Card.equals(new Card(0,0,0,0), new Card(1,0,0,0)).should.be.false;
            Card.equals(new Card(0,0,0,0), new Card(0,1,0,0)).should.be.false;
            Card.equals(new Card(0,0,0,0), new Card(0,0,1,0)).should.be.false;
            Card.equals(new Card(0,0,0,0), new Card(0,0,0,1)).should.be.false;
        })
    })
})