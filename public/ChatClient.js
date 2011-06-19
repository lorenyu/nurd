(function($) {
    /* Turns a form into a chat client */
    $.fn.chat = function(method) {
        
        var methods = {
            init : function( options ) {
                var self = this;
                this.find('.chat-form').submit(function() {
                    $this = $(this);
                    self.chat( 'sendMessage', $this.find('.sender').val(), $this.find('.msg').val() );
                    $this.find('.msg').val(''); // clear the input box
                    return false;
                });
                EventEngine.observe('server:chat:sendMsg', function(event) {
                    self.chat( 'addMessage', event.data.sender, event.data.msg );
                });
            },
            sendMessage : function( sender, msg, options ) { 
                EventEngine.fire('client:chat:sendMsg', {
                    sender: sender,
                    msg: msg
                });
            },
            addMessage : function( sender, msg, options ) {
                var chatMsgs = this.find('.chat-msgs');
                var sortChronological = options && options.sortChronological;
                if (options && typeof(options.renderMsg) === 'function') {
                    var msgHtml = options.renderMsg(sender, msg);
                } else {
                    var msgHtml = '<li class="chat-msg">'+
                                    '<span class="sender">'+sender+'</span>'+
                                    '<span class="msg">'+msg+'</span>'+
                                    '</li>';
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
        
        
    }
})(jQuery);
