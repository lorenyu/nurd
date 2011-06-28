var nurd = this.nurd = nurd || {};
(function() {
    nurd = this.nurd;
    
    var TEMPLATE,
        CARDS_IN_PLAY_TEMPLATE,
        PLAYERS_TEMPLATE;
    
    var View = nurd.View = function(gameModel, gameClient) {
        this.game = gameModel;
        this.client = gameClient;

        var _numSelectedCards = [];
    
        TEMPLATE = $('#game-container').html();
        CARDS_IN_PLAY_TEMPLATE = $('.cards-in-play').html();
        PLAYERS_TEMPLATE = $('.players').html();
        
        $(this.game).bind('gameUpdate', $.proxy(this.onGameUpdate, this));
        $(this.game).bind('gameEnd', $.proxy(this.onGameEnd, this));
        $(this.game).bind('playerScores', $.proxy(this.onPlayerScores, this));
        $(this.game).bind('playerFailedSet', $.proxy(this.onPlayerFailedSet, this));
        
        $('.game-end-overlay .close').click(function(event) {
            $(this).parents('.game-end-overlay').hide();
        });

        //EventEngine.observe('client:endGame', proxy(this.endGame, this));
    };
    
    View.prototype.onGameUpdate = function(event, data) {
        var gameState = data.gameState;
    
        var cards = gameState.cardsInPlay,
            me, player, players = gameState.players,
            deckSize = gameState.deckSize,
            i, numPlayers;

        for (i = 0, numPlayers = players.length; i < numPlayers; i++) {
            player = players[i];
            if (player.publicId === this.client.publicId) {
                this.client.player = me = player;
                player.isMe = true;
            }
        }

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
        
        $('#draw-cards-btn .num-requests').text(gameState.numMoreCardsRequests);
        $('#restart-game-btn .num-requests').text(gameState.numRestartGameRequests);
        $('#end-game-btn .num-requests').text(gameState.numEndGameRequests);
    };
    
    View.prototype.onGameEnd = function(event) {
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
            overlay.find('.runner-up.second .score').text(players[2].score);
            overlay.find('.runner-up.second').show();
        } else {
            overlay.find('.runner-up.second').hide();
        }
        overlay.show();
    };
    
    View.prototype.onPlayerScores = function(event) {
        var $tmp = $('#tmp');
        $tmp.html('<ul class="cards set">' + CARDS_IN_PLAY_TEMPLATE + '</ul>');
        $tmp.find('.cards').render({
            cards: event.data.cards
        }, PureDirectives.CARDS_IN_PLAY);
        $('#chat').chat( 'addMessage', event.data.player.name, $tmp.html() );
    };
    
    View.prototype.onPlayerFailedSet = function(event) {
        var $tmp = $('#tmp');
        $tmp.html('<ul class="cards false-set">' + CARDS_IN_PLAY_TEMPLATE + '</ul>');
        $tmp.find('.cards').render({
            cards: event.data.cards
        }, PureDirectives.CARDS_IN_PLAY);
        $('#chat').chat( 'addMessage', event.data.player.name, $tmp.html() );
    };
    
    /*
    View.prototype.onPlayerRegistered = 
    EventEngine.observe('server:playerRegistered', proxy(function(event) {
        this.onPlayerRegistered(event.data.registerId, event.data.encPlayerId, event.data.playerPublicId, event.data.name);
        this.stayIntervalId = setInterval(proxy(this.stay, this), Math.floor(event.data.playerTimeout / 2));
        //log('stayIntervalId = ' + this.stayIntervalId);
    }, this));
    */
    
    /*
    View.prototype.onChangeName = .observe('client:changeName', function(event) {
        $('#name-field').val(event.data.name);
        $('#chat .chat-form .sender').val(event.data.name);
    });
    */

})();

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