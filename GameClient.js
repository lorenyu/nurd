this.GameClient = function() {
    this.id = 0;
    this.publicId = 0;
    this.player = null;

    var _game = null;

    var _registerId;
    var _secret;
        
    function init() {
        
        EventEngine.observe('server:playerRegistered', proxy(function(event) {
            this.onPlayerRegistered(event.data.registerId, event.data.encPlayerId, event.data.playerPublicId, event.data.name);
            this.stayIntervalId = setInterval(proxy(this.stay, this), Math.floor(event.data.playerTimeout / 2));
            //log('stayIntervalId = ' + this.stayIntervalId);
        }, this));

        EventEngine.observe('client:changeName', function(event) {
            $('#name-field').val(event.data.name);
            $('#chat .chat-form .sender').val(event.data.name);
        });

        $('#restart-game-btn').click(proxy(this.requestGameRestart, this));
        $('#draw-cards-btn').click(proxy(this.requestMoreCards, this));
        $('#end-game-btn').click(proxy(this.requestEndGame, this));

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

    this.onPlayerRegistered = function(registerId, encPlayerId, playerPublicId, name) {
        if (registerId === _registerId) {
            this.id = encPlayerId - _secret;
            this.publicId = playerPublicId;
            EventEngine.observeAll(proxy(onEvent, this));

            $('#name-field').val(name);
            $('#chat .chat-form .sender').val(name);

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
        //log('requesting more cards');
        var btn = $('#draw-cards-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            EventEngine.fire('client:cancelMoreCardsRequest', {
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            EventEngine.fire('client:dealMoreCards', {
                playerId: this.id
            });
        }
    }

    this.requestGameRestart = function() {
        //log('requesting game restart');
        var btn = $('#restart-game-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            EventEngine.fire('client:cancelRestartGameRequest', {
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            EventEngine.fire('client:startGame', {
                playerId: this.id
            });
        }
    }
    
    this.requestEndGame = function() {
        //log('requesting game end');
        var btn = $('#end-game-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            EventEngine.fire('client:cancelEndGameRequest', {
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            EventEngine.fire('client:endGame', {
                playerId: this.id
            });
        }
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
    var jade = require('jade');

    this.client = new GameClient();

    function init() {
        TEMPLATE = $('#game-container').html();
        CARDS_IN_PLAY_TEMPLATE = $('.cards-in-play').html();
        PLAYERS_TEMPLATE = $('.players').html();
        
        var cardsRenderer = jade.compile($('#cards-view').text());
        var playersRenderer = jade.compile($('#players-view').text());
        var balloonRenderer = jade.compile($('#balloon-view').text());
        var nextBalloonColor = 0;


        var client = this.client;

        EventEngine.observe('server:gameUpdated', function(event) {
            if (!client.id) { return; } // if player hasn't registered yet, there's no need updating the game state
            
            //log('server:gameUpdated');
            var cards = event.data.cardsInPlay,
                me, player, players = event.data.players,
                deckSize = event.data.deckSize,
                i, numPlayers;

            for (i = 0, numPlayers = players.length; i < numPlayers; i++) {
                player = players[i];
                if (player.publicId === client.publicId) {
                    client.player = me = player;
                    player.isMe = true;
                }
            }

            var playerIds = _.pluck(players, 'publicId');
            var currentPlayerIds = $('.players-container .player').map(function(index, player) {
                return parseInt($(player).attr('playerid'));
            });
            var newPlayerIds = _.difference(playerIds, currentPlayerIds);
            var removedPlayerIds = _.difference(currentPlayerIds, playerIds);
            
            _.each(removedPlayerIds, function(playerId) {
                $('.balloons .balloon[playerid=' + playerId + ']').remove();
            });
            _.each(newPlayerIds, function(playerId) {
                var player = _.detect(players, function(player) { return player.publicId == playerId; });
                player.color = nextBalloonColor;
                nextBalloonColor = (nextBalloonColor + 1) % 15;
                $('.balloons').append(balloonRenderer.call(player));
            });
            
            
            $('.players-container').html(playersRenderer.call({ players: players }));
            $('.cards-in-play').html(cardsRenderer.call({ cards: cards }));

            if (deckSize > 0) {
                $('#draw-cards-btn').show();
                $('#end-game-btn').hide();
            } else {
                $('#draw-cards-btn').hide();
                $('#end-game-btn').show();
            }
            
            if (me.isRequestingMoreCards) {
                $('#draw-cards-btn').addClass('selected');
            } else {
                $('#draw-cards-btn').removeClass('selected');
            }
            if (me.isRequestingGameRestart) {
                $('#restart-game-btn').addClass('selected');
            } else {
                $('#restart-game-btn').removeClass('selected');
            }
            if (me.isRequestingGameEnd) {
                $('#end-game-btn').addClass('selected');
            } else {
                $('#end-game-btn').removeClass('selected');
            }
            
            $('#draw-cards-btn .num-requests').text(event.data.numMoreCardsRequests);
            $('#restart-game-btn .num-requests').text(event.data.numRestartGameRequests);
            $('#end-game-btn .num-requests').text(event.data.numEndGameRequests);

            $('.cards-in-play .card').bind('mousedown', function() {
                var card = $(this);
                card.toggleClass('selected');
                var selectedCards = $('.cards-in-play .card.selected');
                if (selectedCards.length == 3) {
                    selectedCards = $.map(selectedCards, function(card) {
                        //log($(card).attr('json'));
                        return JSON.parse($(card).attr('json'));
                    });
                    client.selectCards(selectedCards);
                }
            });

        });
        
        EventEngine.observe('server:gameEnded', function(event) {
            var overlay = $('.game-end-overlay'),
                players = event.data.players,
                numPlayers = players.length;
            overlay.find('.winner .name').text(players[0].name);
            overlay.find('.winner .score').text(players[0].score);
            if (numPlayers > 1) {
                overlay.find('.runner-up.first .name').text(players[1].name);
                overlay.find('.runner-up.first .score').text(players[1].score);
                overlay.find('.runner-up.first').show();
            } else {
                overlay.find('.runner-up.first').hide();
            }
            if (numPlayers > 2) {
                overlay.find('.runner-up.second .name').text(players[2].name);
                overlay.find('.runner-up.second .score').text(players[1].score);
                overlay.find('.runner-up.second').show();
            } else {
                overlay.find('.runner-up.second').hide();
            }
            overlay.show();
        });
        
        EventEngine.observe('server:playerScored', function(event) {
            var player = event.data.player,
                balloon = $('.balloon[playerid=' + player.publicId + ']');
                
            balloon.css('bottom', (player.score * 17.64) + 'px');
            $('#chat').chat( 'addMessage', player.name, cardsRenderer.call({ 'class' : 'set', cards : event.data.cards }) );
        });
        
        EventEngine.observe('server:playerFailedSet', function(event) {
            $('#chat').chat( 'addMessage', event.data.player.name, cardsRenderer.call({ 'class' : 'false-set', cards: event.data.cards }) );
        });
        
        $('.game-end-overlay .close').click(function(event) {
            $(this).parents('.game-end-overlay').hide();
        });

        $('#chat').chat();

        this.client.register();
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
                        html += '<span class="card-object ' + cls  + ' object'+ i + '"></span>';                   }
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
                '.@class' : function(arg) {
                    var player = arg.item,
                        cls = 'player';
                    if (player.isMe) {
                        cls += ' me';
                    }
                    return cls;
                },
                '.name' : 'player.name',
                '.score' : 'player.score',
                '.num-sets' : 'player.numSets',
                '.num-false-sets' : 'player.numFalseSets'
            }
        }
    }
};