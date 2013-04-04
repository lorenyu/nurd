this.ChatServer = function() {
    var init = function(eventEngine) {
        eventEngine.observe('client:chat:sendMsg', function(event) {
            var sender = event.data.sender;
            var msg = event.data.msg;
            if (msg) {
                if (typeof(sender) !== 'string') {
                    sender = JSON.stringify(sender);
                }
                if (typeof(msg) !== 'string') {
                    msg = JSON.stringify(sender);
                    var allowedCharacters = /^[^\w.,;:\'\"?\/`~!@#$%^&*()-=_+ \[\]{}\\|]+$/ig;
                    msg = msg.replace(/\</g, '&lt;').replace(/\>/g, '&gt;').replace(
                            allowedCharaceters, '');
                }
                console.log(sender);
                eventEngine.fire('server:chat:sendMsg', {    
                    sender: sender,
                    msg: msg
                });
            }
        });
    };

    init.apply(this, arguments);
};