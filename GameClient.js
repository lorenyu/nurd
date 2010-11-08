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
            this.stayIntervalId = setInterval(proxy(this.stay, this), Math.floor(event.data.playerTimeout / 2));
            log('stayIntervalId = ' + this.stayIntervalId);
        }, this));

        $('#restart-game-btn').live('click', proxy(this.requestGameRestart, this));
        $('#draw-cards-btn').live('click', proxy(this.requestMoreCards, this));

        $('#name-change-form').submit(proxy(function() {
            this.changeName($('#name-field').val());
            return false;
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
            EventEngine.observeAll(proxy(onEvent, this));

            var leave = proxy(function() {
                if (this.id) {
                    EventEngine.fire('client:leave', {
                        playerId: this.id
                    });
                }
            }, this);
            $(window).unload(leave);
            $(window).onbeforeunload = leave;
        }
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

    this.stay = function() {
        EventEngine.fire('client:stay', {
            playerId: this.id
        });
    }

    this.changeName = function(name) {
        // TODO: do some client-side validation
        EventEngine.fire('client:changeName', {
            playerId: this.id,
            name: name
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

this.Game = function() {

    var TEMPLATE;
    var CARDS_IN_PLAY_TEMPLATE;
    var PLAYERS_TEMPLATE;
    var _numSelectedCards = [];

    this.player = new Player();

    function init() {
        TEMPLATE = $('#game-container').html();
        CARDS_IN_PLAY_TEMPLATE = $('.cards-in-play').html();
        PLAYERS_TEMPLATE = $('.players').html();


        var player = this.player;

        EventEngine.observe('server:gameUpdated', function(event) {
            log('server:gameUpdated');
            var cards = event.data.cardsInPlay;
            var players = event.data.players;

/*
            $('#game-container').html(TEMPLATE).render({
                cards:cards,
                players:players
            }, PureDirectives.GAME);*/

            $('.players').html(PLAYERS_TEMPLATE).render({
                players:players
            }, PureDirectives.PLAYERS);

            $('.cards-in-play').html(CARDS_IN_PLAY_TEMPLATE).render({
                cards:cards
            }, PureDirectives.CARDS_IN_PLAY);
        });

        $('.cards-in-play .card').live('mousedown', function() {
            var card = $(this);
            card.toggleClass('selected');
            var selectedCards = $('.cards-in-play .card.selected');
            if (selectedCards.length == 3) {
                selectedCards = $.map(selectedCards, function(card) {
                    log($(card).attr('json'));
                    return JSON.parse($(card).attr('json'));
                });
                player.selectCards(selectedCards);
            }
        });

        $('#chat').chat();
        EventEngine.observe('client:changeName', function(event) {
            $('#name-field').val(event.data.name);
            $('#chat .chat-form .sender').val(event.data.name);
        });
        EventEngine.observe('server:playerRegistered', function(event) {
            $('#name-field').val(event.data.name);
            $('#chat .chat-form .sender').val(event.data.name);
        });

        this.player.register();
        //EventEngine.observe('client:endGame', proxy(this.endGame, this));
    }

    init.apply(this, arguments);
};

this.PureDirectives = {
    CARDS_IN_PLAY: {
        '.card' : {
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
                '.' : function(arg) {
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
                '.@class' : function(arg) {
                    var card = arg.item;
                    var shape = card.attributes[0];
                    var color = card.attributes[1];
                    var shading = card.attributes[2];
                    var number = card.attributes[3];
                    var html = '';
                    var cls = 'card shape'+shape + ' color'+color + ' shading'+shading + ' number' + number;
                    return cls;
                },
                '.@json' : function(arg) {
                    return JSON.stringify(arg.item);
                }
            }
        }
    },
    PLAYERS: {
        '.player' : {
            'player<-players' : {
                '.name' : 'player.name',
                '.score' : 'player.score',
                '.num-sets' : 'player.numSets',
                '.num-false-sets' : 'player.numFalseSets'
            }
        }
    }
};