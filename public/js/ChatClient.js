(function($) {
    var jade = require('jade'),
        msgRenderer = jade.compile('' + 
            'li.chat-msg\n' +
            '    span.sender= this.sender\n' +
            '    - if (this.sanitize)\n' +
            '        span.msg= this.msg\n' +
            '    - else\n' +
            '        span.msg!= this.msg\n');
    
    /* Turns a form into a chat client */
    $.fn.chat = function(method) {
        
        var methods = {
            init : function(eventEngine, options) {
                var self = this;
                this.options = options || {};
                this.eventEngine = eventEngine;
                this.channel = this.options.channel || 'global';
                this.find('.chat-form').submit(function() {
                    $this = $(this);
                    self.chat( 'sendMessage', $this.find('.sender').val(), $this.find('.msg').val() );
                    $this.find('.msg').val(''); // clear the input box
                    return false;
                });
                this.eventEngine.observe('server:chat:' + this.channel + ':sendMsg', function(event) {
                    self.chat( 'addMessage', event.data.sender, event.data.msg );
                });
            },
            sendMessage : function( sender, msg, options ) { 
                this.eventEngine.fire('client:chat:' + this.channel + ':sendMsg', {
                    sender: sender,
                    msg: msg
                });
            },
            addMessage : function( sender, msg, options ) {
                options = $.extend({
                    sortChronological : false,
                    sanitize : true
                }, options || {});
                var chatMsgs = this.find('.chat-msgs'),
                    sortChronological = options.sortChronological;
                if (options && typeof(options.renderMsg) === 'function') {
                    var msgHtml = options.renderMsg(sender, msg);
                } else {
                    var msgHtml = msgRenderer.call({
                            sender: sender,
                            msg: msg,
                            sanitize: options.sanitize
                        });
                }
                if (sortChronological) {
                    chatMsgs.append(msgHtml);
                } else {
                    chatMsgs.prepend(msgHtml);
                }
            }
        };
  
        if ( methods[method] ) {
            return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
        } else if ( typeof method === 'object' || ! method ) {
            return methods.init.apply( this, arguments );
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.tooltip' );
        }
        
        
    };
})(jQuery);
