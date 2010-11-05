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

        $(window).unload(proxy(function() {
            if (this.id) {
                EventEngine.fire('client:leave', {
                    playerId: player.id
                });
            }
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

    this.requestMoreCards = function() {
        log('requesting more cards');
        EventEngine.fire('client:dealMoreCards', {
            playerId: this.id
        });
    }

    this.requestGameRestart = function() {
        log('requesting game restart');
        EventEngine.fire('client:startGame', {
            playerId: this.id
        });
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
        TEMPLATE = $('#game-container').html();

        EventEngine.observe('server:gameUpdated', function(event) {
            log('server:gameUpdated');
            var cards = event.data.cardsInPlay;
            var players = event.data.players;

            $('#game-container').html(TEMPLATE).render({
                cards:cards,
                players:players
            }, PureDirectives.GAME);
        });

        $('.cards-in-play .card').live('click', function() {
            var card = $(this);
            card.toggleClass('selected');
            var selectedCards = $('.cards-in-play .card.selected').siblings('.json');
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
        '.card-container' : {
            'card<-cards' : {
/*
                'img@src' : function(arg) {
                    var card = arg.item;
                    var attrStr = '';
                    for (var i = 0; i < 4; i += 1) {
                        attrStr += card.attributes[i];
                    }
                    return '/images/' + attrStr + '.png';
                },*/
                '.card-css' : function(arg) {
                    var card = arg.item;
                    var shape = card.attributes[0];
                    var color = card.attributes[1];
                    var shading = card.attributes[2];
                    var number = card.attributes[3];
                    var html = '';
                    var cls = ' shape'+shape + ' color'+color + ' shading'+shading;
                    for (var i = 0; i <= number; i += 1) {
                        html += '<div class="card-object ' + cls  + ' object'+ i + '"></div>';                   }
                    return html;
                },
                '.card-css@class' : function(arg) {
                    var card = arg.item;
                    var shape = card.attributes[0];
                    var color = card.attributes[1];
                    var shading = card.attributes[2];
                    var number = card.attributes[3];
                    var html = '';
                    var cls = 'card shape'+shape + ' color'+color + ' shading'+shading + ' number' + number;
                    return cls;
                },
                '.json' : function(arg) {
                    return JSON.stringify(arg.item);
                }
            }
        },
        '.player-container' : {
            'player<-players' : {
                '.name' : 'player.name',
                '.score' : 'player.score',
                '.num-sets' : 'player.numSets',
                '.num-false-sets' : 'player.numFalseSets'
            }
        }
    }
};