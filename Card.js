var util = require('util');
var EventEngine = require('./EventEngine.js').EventEngine;

var log = util.puts;

this.Card = function(shape, color, shading, number) {
    this.attributes = [shape, color, shading, number];
    
    this.getAttribute = function(attributeIndex) {
        return this.attributes[attributeIndex];
    }
};
this.Card.equals = function(cardA, cardB) {
    for (var i = 0; i < 4; i += 1) {
        if (cardA.getAttribute[i] !== cardB.getAttribute[i]) {
            return false;
        }
    }
    return true;
}
