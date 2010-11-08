(function($) {
    /* Turns a form into a chat client */
    $.fn.chat = function(options) {
        this.find('.chat-form').submit(function() {
            $this = $(this);
            EventEngine.fire('client:chat:sendMsg', {
                sender: $this.find('.sender').val(),
                msg: $this.find('.msg').val()
            });
            $this.find('.msg').val(''); // clear the input box
            return false;
        });
        var chatMsgs = this.find('.chat-msgs');
        EventEngine.observe('server:chat:sendMsg', function(event) {
            var sortChronological = options && options.sortChronological;
            if (options && typeof(options.renderMsg) === 'function') {
                var msg = options.renderMsg(event.data.sender,event.data.msg);
            } else {
                var msg = '<li class="chat-msg">'+
                                '<span class="sender">'+event.data.sender+'</span>'+
                                '<span class="msg">'+event.data.msg+'</span>'+
                                '</li>';
            }
            if (sortChronological) {
                chatMsgs.append(msg);
            } else {
                chatMsgs.prepend(msg);
            }
        });
    }
})(jQuery);
