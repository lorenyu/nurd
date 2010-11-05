// requires EventEngine

if (!this.log) {
    this.log = function(x) {
        if (typeof(console) !== 'undefined') {
            console.log(x);
        }
    }
}

/*
 *
  options = {
    onInitialized: function() { }
  }

 */
var EventEngineHttpClient = function(options) {

    // Private properties and methods

    var clientId = null;
    var initialized = false;
    var onInitialized;

    function listen() {
        // wait for events from the server with long polling
        var url = '/ajax/recv';
        if (clientId) {
            var data = { id: clientId };
        } else {
            var data = {};
        }
        if (jQuery) {
            $.ajax({
                url: url,
                data: data,
                success: onServerResponse
            });
        //} else if (Prototype) { // TODO: Add support for Prototype
        //    new Ajax.Request(url, {
        //        onSuccess: this.onServerResponse
        //    });
        } else {
            alert('EventEngineHttpClient requires jQuery to function');
        }
    }

    function onEvent(event) {
        log('onEvent');
        log(event);
        if (event.name.indexOf('http:') === 0) {
            var eventName = event.name.substring('http:'.length); // strip out "http:" prefix from event name
            EventEngine.fire(eventName, event.data);
        } else if (event.name.indexOf('client:') === 0) {
            notify(event.name, event.data);
        }
    }

    function onServerResponse(data) {
        clientId = data.clientId;
        if (!initialized) {
            initialized = true;
            if (onInitialized) {
                onInitialized();
            }
        }

        var events = data.events;
        for (var i = 0, n = events.length; i < n; i += 1) {
            var event = events[i];
            EventEngine.fire(event.name, event.data);
        }
        setTimeout(listen, 0);
    }

    function notify(eventName, eventData) {
        // send event notification to server
        var url = '/ajax/send';
        $.ajax({
            url: url,
            type: 'POST',
            data: {
                id: clientId,
                en: 'http:' + eventName,
                dt: JSON.stringify(eventData)
            }
        });
    }

    function init() {
        if (options) {
            onInitialized = options.onInitialized;
        }
        EventEngine.observeAll(onEvent);
        listen();
    }

    init();
};