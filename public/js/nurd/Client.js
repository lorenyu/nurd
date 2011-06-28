var nurd = this.nurd = nurd || {};
(function($) {
    nurd = this.nurd;
    var Client = nurd.Client = function(gameModel) {
        this.id = 0;
        this.publicId = 0;
        this.player = null;
        this.gameModel = gameModel;
    
        this._registerId = null;
        this._secret = null;
        var self = this;
            
        $(this.gameModel).bind('playerRegistered', $.proxy(this.onPlayerRegistered, this));
    
        $('#restart-game-btn').click($.proxy(this.requestGameRestart, this));
        $('#draw-cards-btn').click($.proxy(this.requestMoreCards, this));
        $('#end-game-btn').click($.proxy(this.requestEndGame, this));
    
        $('#name-change-form').submit($.proxy(function() {
            this.changeName($('#name-field').val());
            return false;
        }, this));
        
        $('.cards-in-play .card').live('mousedown', function(event) {
            var card = $(this);
            card.toggleClass('selected');
            var selectedCards = $('.cards-in-play .card.selected');
            if (selectedCards.length == 3) {
                selectedCards = $.map(selectedCards, function(card) {
                    //log($(card).attr('json'));
                    return JSON.parse($(card).attr('json'));
                });
                self.selectCards(selectedCards);
            }
        });
        
        /*
        View.prototype.onPlayerRegistered = proxy(function(event) {
            this.onPlayerRegistered(event.data.registerId, event.data.encPlayerId, event.data.playerPublicId, event.data.name);
            this.stayIntervalId = setInterval(proxy(this.stay, this), Math.floor(event.data.playerTimeout / 2));
            //log('stayIntervalId = ' + this.stayIntervalId);
        }, this));
        */
    };
    
    nurd.util.inherit(Client, nurd.EventEmitter);
    
    Client.prototype.register = function() {
        this._registerId = nurd.util.Crypto.getRandomKey();
        this._secret = nurd.util.Crypto.getRandomKey();
        $(this).trigger('message', {
            type: 'registerPlayer',
            registerId: this._registerId,
            secret: this._secret
        });
    };
    
    Client.prototype.onPlayerRegistered = function(event, data) {
        var registerId = data.registerId,
            encPlayerId = data.encPlayerId,
            playerPublicId = data.playerPublicId,
            name = data.name;

        if (registerId === this._registerId) {
            this.id = encPlayerId - this._secret;
            this.publicId = playerPublicId;
    
            $('#name-field').val(name);
            $('#chat .chat-form .sender').val(name);
    
            var leave = $.proxy(function() {
                if (this.id) {
                    $(this).trigger('message', {
                        type: 'leave',
                        playerId: this.id
                    });
                }
            }, this);
            $(window).unload(leave);
            $(window).onbeforeunload = leave;
        }
    };
    
    Client.prototype.requestMoreCards = function() {
        //log('requesting more cards');
        var btn = $('#draw-cards-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            $(this).trigger('message', {
                type: 'cancelMoreCardsRequest',
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            $(this).trigger('message', {
                type: 'dealMoreCards',
                playerId: this.id
            });
        }
    };
    
    Client.prototype.requestGameRestart = function() {
        //log('requesting game restart');
        var btn = $('#restart-game-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            $(this).trigger('message', {
                type: 'cancelRestartGameRequest',
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            $(this).trigger('message', {
                type: 'startGame',
                playerId: this.id
            });
        }
    };
    
    Client.prototype.requestEndGame = function() {
        //log('requesting game end');
        var btn = $('#end-game-btn');
        if (btn.hasClass('selected')) {
            btn.removeClass('selected');
            $(this).trigger('message', {
                type: 'client:cancelEndGameRequest',
                playerId: this.id
            });
        } else {
            btn.addClass('selected');
            $(this).trigger('message', {
                type: 'endGame',
                playerId: this.id
            });
        }
    };
    
    Client.prototype.stay = function() {
        $(this).trigger('message', {
            type: 'stay',
            playerId: this.id
        });
    };
    
    Client.prototype.changeName = function(name) {
        // TODO: do some client-side validation
        $(this).trigger('message', {
            type: 'changeName',
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
    
    Client.prototype.selectCards = function(cards) {
        $(this).trigger('message', {
            type: 'selectCards',
            playerId: this.id,
            cards: cards
        });
    };
})(jQuery);