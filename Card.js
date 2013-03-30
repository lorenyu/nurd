var Card = this.Card = function(shape, color, shading, number) {
    if (shape < 0 || shape >= 3) {
        throw new Error('shape must be 0, 1, or 2');
    }
    if (color < 0 || color >= 3) {
        throw new Error('color must be 0, 1, or 2');
    }
    if (shading < 0 || shading >= 3) {
        throw new Error('shading must be 0, 1, or 2');
    }
    if (number < 0 || number >= 3) {
        throw new Error('number must be 0, 1, or 2');
    }
    this.attributes = [shape, color, shading, number];
};
Card.createFromJSON = function(cardData) {
    return new Card(cardData.attributes[0], cardData.attributes[1], cardData.attributes[2], cardData.attributes[3]);
};
Card.equals = function(cardA, cardB) {
    if (!cardA && !cardB) {
        return true;
    }
    if (!cardA || !cardB) {
        return false;
    }
    for (var i = 0; i < 4; i += 1) {
        if (cardA.attributes[i] !== cardB.attributes[i]) {
            return false;
        }
    }
    return true;
}
