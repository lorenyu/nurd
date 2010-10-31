this.Player = function() {
    this.id = 0;
    this.score = 0;
    this.numSets = 0;
    this.numFalseSets = 0;

    var _game = null;

    var _registerId;
    var _secret;
        
    function init() {
        EventEngine.observe('server:playerRegistered', proxy(function(event) {
            this.onPlayerRegistered(event.data.registerId, event.data.encPlayerId);
        }, this));
        EventEngine.observe('client:selectCards', proxy(function(event) {
            this.selectCards(event.data.cards);
        }, this));
    }

    this.register = function() {
        _registerId = Crypto.getRandomKey();
        _secret = Crypto.getRandomKey();
        EventEngine.fire('client:registerPlayer', {
            registerId: _registerId,
            secret: _secret
        });
    }

    this.onPlayerRegistered = function(registerId, encPlayerId) {
        if (registerId === _registerId) {
            this.id = encPlayerId - _secret;
        }
    }

    /*
        this.joinGame = function(game) {
            if (game.addPlayer(this)) {
                _game = game;
                return true;
            }
            return false;
        }
*/

    this.selectCards = function(cards) {
        
    }

    init.apply(this, arguments);
};

var Game = function() {

    function init() {
        EventEngine.observe('server:playerRegistered', proxy(function(event) {
            this.registerPlayer(event.data.registerId, event.data.secret);
        }, this));
        EventEngine.observe('client:startGame', proxy(this.startGame, this));
        EventEngine.observe('client:dealMoreCards', proxy(this.dealMoreCards, this));
        //EventEngine.observe('client:endGame', proxy(this.endGame, this));
    }

    init.apply(this, arguments);
};