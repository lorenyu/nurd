this.GameClient = function(eventEngine, gameId) {
    this.gameId = gameId;
    this.id = 0;
    this.publicId = 0;
    this.player = null;

    var _game = null;

    var _registerId;
    var _secret;
        
    function init() {

        eventEngine.observe('server:game:' + this.gameId + ':playerRegistered', proxy(function(event) {
            this.onPlayerRegistered(event.data.registerId, event.data.encPlayerId, event.data.playerPublicId, event.data.name);
            this.stayIntervalId = setInterval(proxy(this.stay, this), Math.floor(event.data.playerTimeout / 2));
            //log('stayIntervalId = ' + this.stayIntervalId);
        }, this));

        eventEngine.observe('client:game:' + this.gameId + ':changeName', function(event) {
            $('#name-field').val(event.data.name);
            $('#chat .chat-form .sender').val(event.data.name);
        });


        var clickEventType = (Modernizr.touch) ? 'touchstart' : 'click';
        $('#restart-game-btn').bind(clickEventType, proxy(this.requestGameRestart, this));

        $('#name-change-form').submit(proxy(function() {
            this.changeName($('#name-field').val());
            return false;
        }, this));
        $('#name-change-form #name-field').focus();
    }

    function onEvent(event) {
        
    }

    this.register = function(name) {
        _registerId = Crypto.getRandomKey();
        _secret = Crypto.getRandomKey();
        eventEngine.fire('client:game:' + this.gameId + ':registerPlayer', {
            name: name,
            registerId: _registerId,
            secret: _secret
        });
    };

    this.onPlayerRegistered = function(registerId, encPlayerId, playerPublicId, name) {
        if (registerId === _registerId) {
            this.id = encPlayerId - _secret;
            this.publicId = playerPublicId;
            eventEngine.observeAll(proxy(onEvent, this));

            $('#name-field').val(name);
            $('#chat .chat-form .sender').val(name);

            var leave = proxy(function() {
                if (this.id) {
                    eventEngine.fire('client:game:' + this.gameId + ':leave', {
                        playerId: this.id
                    });
                }
            }, this);
            $(window).unload(leave);
            $(window).onbeforeunload = leave;
        }
    };

    this.requestGameRestart = function() {
        //log('requesting game restart');
        var btn = $('#restart-game-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            eventEngine.fire('client:game:' + this.gameId + ':cancelRestartGameRequest', {
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            eventEngine.fire('client:game:' + this.gameId + ':startGame', {
                playerId: this.id
            });
        }
    };

    this.stay = function() {
        eventEngine.fire('client:game:' + this.gameId + ':stay', {
            playerId: this.id
        });
    };

    this.changeName = function(name) {
        // TODO: do some client-side validation
        eventEngine.fire('client:game:' + this.gameId + ':changeName', {
            playerId: this.id,
            name: name
        });
    };

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
        eventEngine.fire('client:game:' + this.gameId + ':selectCards', {
            playerId: this.id,
            cards: cards
        });
    };

    init.apply(this, arguments);
};

this.Game = function(eventEngine, id) {

    var _numSelectedCards = [],
        jade = require('jade'),
        client = this.client = new GameClient(eventEngine, id),
        self = this,
        firstUpdate = true;

    this.id = id;

    function init() {
        
        eventEngine.observe('server:game:' + this.id + ':playerNameChanged', function(event) {
            var playerId = event.data.playerId;
            $('.balloons .balloon[playerid=' + playerId + '] .name').text(event.data.name);
        });
        
        eventEngine.observe('server:game:' + this.id + ':gameStarted', function(event) {
            $('.balloon').css('bottom', '0px');
            $('#chat').chat( 'addMessage', 'TTTRIO', 'Game restarted' );
            
            self.onGameUpdated(event);
        });
        

        eventEngine.observe('server:game:' + this.id + ':gameUpdated', this.onGameUpdated);
        
        eventEngine.observe('server:game:' + this.id + ':gameEnded', function(event) {
            var players = event.data.players,
                numPlayers = players.length;
            
            if (players.length > 2) {
                $('#chat').chat('addMessage', players[2].name + ' is second runner up with ' + players[2].score + ' points!');
            }

            if (players.length > 1) {
                $('#chat').chat('addMessage', players[1].name + ' is runner up with ' + players[1].score + ' points!');
            }

            if (players.length > 0) {
                $('#chat').chat('addMessage', players[0].name + ' wins with ' + players[0].score + ' points!');
            }
            
        });
        
        eventEngine.observe('server:game:' + this.id + ':playerScored', function(event) {
            var player = event.data.player,
                balloon = $('.balloon[playerid=' + player.publicId + ']');
                
            balloon.css('bottom', (player.score * 34) + 'px'); // 34px = (400px - 60px) / 10 = (height of balloons area - height of balloon) / (number of points)
            $('#chat').chat( 'addMessage', player.name, jadeTemplates.render('cards', { 'className' : 'set', cards : event.data.cards }), { sanitize: false } );
        });
        
        eventEngine.observe('server:game:' + this.id + ':playerFailedSet', function(event) {
            var player = event.data.player,
                balloon = $('.balloon[playerid=' + player.publicId + ']');
                
            balloon.css('bottom', (player.score * 34) + 'px'); // 34px = (400px - 60px) / 10 = (height of balloons area - height of balloon) / (number of points)
            $('#chat').chat( 'addMessage', player.name, jadeTemplates.render('cards', { 'className' : 'false-set', cards : event.data.cards }), { sanitize: false } );
        });
        
        eventEngine.observe('client:game:' + this.id + ':changeName', function(event) {
            client.register(event.data.name);
            $('.name-form-overlay-container').hide();
        });
        
        //eventEngine.observe('client:game:' + this.id + ':endGame', proxy(this.endGame, this));
    }
    
    this.onGameUpdated = function(event) {
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
            return parseInt($(player).attr('playerid'), 10);
        });
        var newPlayerIds = _.difference(playerIds, currentPlayerIds);
        var removedPlayerIds = _.difference(currentPlayerIds, playerIds);
        
        _.each(removedPlayerIds, function(playerId) {
            $('.balloons .balloon[playerid=' + playerId + ']').remove();
        });
        _.each(newPlayerIds, function(playerId) {
            var player = _.detect(players, function(player) { return player.publicId == playerId; });
            $('.balloons').append(jadeTemplates.render('balloon', player));
        });
        
        $('.players-container').html(jadeTemplates.render('players', { players: players }));
        $('.cards-in-play').html(jadeTemplates.render('cards', { cards: cards }));

        if (deckSize > 0) {
            $('#draw-cards-btn').show();
        } else {
            $('#draw-cards-btn').hide();
        }
        
        if (me.isRequestingGameRestart) {
            $('#restart-game-btn').addClass('selected');
        } else {
            $('#restart-game-btn').removeClass('selected');
        }
        
        var numRestartGameRequests = event.data.numRestartGameRequests;
        $('#restart-game-btn .players-left').text(Math.ceil(players.length * 2/3) - numRestartGameRequests);
        
        
        var clickEventType = Modernizr.touch ? 'touchstart' : 'mousedown';
        $('.cards-in-play .card').bind(clickEventType, function() {
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
            return false; // Prevents iPhone's double-tap zoom functionality
        });
        
        if (firstUpdate) {
            // move balloons to right place on first update
            $.each(players, function(i, player) {
                $('.balloon[playerid=' + player.publicId + ']').css('bottom', (player.score * 17.64) + 'px');
            });
            firstUpdate = false;
        }
    };

    init.apply(this, arguments);
};