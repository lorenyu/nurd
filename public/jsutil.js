this.log = function(x) {
    if (typeof console !== 'undefined') {
        console.log(x);
    }
}

this.proxy = function(fn, object) {
    return function() {
        return fn.apply(object, arguments);
    }
};

this.Crypto = {
    getRandomKey: function() {
        return Math.floor(1e12 * Math.random());
    }
};
