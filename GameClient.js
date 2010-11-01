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
    }

    function onEvent(event) {
        switch(event.name) {
        
        default: break;
        }
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
        EventEngine.observeAll(proxy(onEvent, this));
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
        EventEngine.fire('client:selectCards', {
            playerId: this.id,
            cards: cards
        });
    }

    init.apply(this, arguments);
};

this.Game = function() {

    function init() {
        EventEngine.observe('server:gameUpdated', function(event) {
            log('server:gameUpdated');
            var cards = event.data.cardsInPlay;
            var html = '';
            for (var i = 0, n = cards.length; i < n; i += 1) {
                var card = cards[i];
                var attributesStr = '' + card.attributes[0] + card.attributes[1] + card.attributes[2] + card.attributes[3];
                html += '<img src="/images/' + attributesStr + '.png" ></img>';
            }
            $('#game-container').html(html);
        });

        //EventEngine.observe('client:endGame', proxy(this.endGame, this));
    }

    init.apply(this, arguments);
};