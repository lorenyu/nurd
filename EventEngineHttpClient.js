var EventEngineHttpClient = function() {
    function _longPoll() {
        // wait for events from the server
        
    }
    function _onServerResponse(response) {
        var i,
            n;
        for (i = 0, n = response.events.length; i < n; i += 1) {
            event = response.events[i];
            // EE.fire(event);
        }
    }
    function _notify(eventName, eventData) {
        // send event notification to server
    }
    return {
        init: function() {
            EventEngine.observeAll(_onServerResponse);
            _longPoll();
        }
    };
}();