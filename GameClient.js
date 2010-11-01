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

this.player = new Player();

this.Game = function() {

    var TEMPLATE;
    var _numSelectedCards = [];

    function init() {
        TEMPLATE = $('#game-container .cards-in-play').html();

        EventEngine.observe('server:gameUpdated', function(event) {
            log('server:gameUpdated');
            var cards = event.data.cardsInPlay;

            $('#game-container .cards-in-play').html(TEMPLATE).render({cards:cards}, PureDirectives.GAME);
        });

        $('.cards-in-play .card').live('click', function() {
            var card = $(this);
            card.toggleClass('selected');
            var selectedCards = $('.cards-in-play .card.selected .json');
            if (selectedCards.length == 3) {
                selectedCards = $.map(selectedCards, function(card) {
                    log($(card).html());
                    return JSON.parse($(card).html());
                });
                player.selectCards(selectedCards);
            }
        });

        //EventEngine.observe('client:endGame', proxy(this.endGame, this));
    }

    init.apply(this, arguments);
};

this.PureDirectives = {
    GAME: {
        '.card' : {
            'card<-cards' : {
                'img@src' : function(arg) {
                    var card = arg.item;
                    var attrStr = '';
                    for (var i = 0; i < 4; i += 1) {
                        attrStr += card.attributes[i];
                    }
                    return '/images/' + attrStr + '.png';
                },
                '.json' : function(arg) {
                    return JSON.stringify(arg.item);
                }
            }
        }
    }
};