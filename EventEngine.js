this.EventEngine = function() {
    var _handlersByEventName = {};
    var _eventTree = {};
    return {
        fire: function(event) {
            var eventName = event.name,
                i,
                n,
                handlers,
                handler;
            while (eventName) {
                handlers = _handlersByEventName[eventName];
                for (i = 0, n = handlers.length; i < n; i += 1) {
                    handler = handlers[i];
                    handler(event);
                }
                eventName = _eventTree[eventName];
            }
        },
        observe: function(eventName, handler) {
            var handlers = _handlersByEventName[eventName];
            if (!handlers) {
                handlers = []
                _handlersByEventName[eventName] = handlers;
            }
            handlers.push(handler);
        },
        stopObserving: function(eventName, handler) {
            var handlers = _handlersByEventName[eventName],
                index;
            if (handlers) {
                return;
            }
            index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
            }
        },
        extendEvent: function(eventName, parentEventName) {
            _eventTree[eventName] = parentEventName;
        }
    };
}();