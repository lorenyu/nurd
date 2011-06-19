this.EventEngine = function() {
    var _handlersByEventName = {};
    var _handlersByCallback = [];
    var _globalHandlers = [];
    var _eventTree = {};
    var _nextEventId = 1;
    return {
        fire: function(eventName, eventData) {
            var eventName;
            var i, n;
            var event = { id: _nextEventId, name: eventName, data: eventData};
            _nextEventId += 1;
            //while (eventName) {
            var handlers = _handlersByEventName[eventName];
            if (handlers) {
                for (i = 0, n = handlers.length; i < n; i += 1) {
                    handlers[i](event);
                }
            }
            //    eventName = _eventTree[eventName];
            //}
            for (i = 0, n = _globalHandlers.length; i < n; i += 1) {
                _globalHandlers[i](event);
            }
        },
        observe: function(eventName, handler) {
            if (typeof(eventName) === 'string') {
                var handlers = _handlersByEventName[eventName];
                if (!handlers) {
                    handlers = []
                    _handlersByEventName[eventName] = handlers;
                }
                handlers.push(handler);
            } else if (typeof(eventName) === 'function') {
                _handlersByCallback.push([eventName, handler]);
            }
        },
        observeAll: function(handler) {
            _globalHandlers.push(handler);
        },
        stopObserving: function(eventName, handler) {
            var handlers = _handlersByEventName[eventName],
                index;
            if (!handlers) {
                return false;
            }
            var index = handlers.indexOf(handler);
            if (index !== -1) {
                handlers.splice(index, 1);
                return true;
            }
            return false;
        },
        stopObservingAll: function(handler) {
            var index = _globalHandlers.indexOf(handler);
            if (index !== -1) {
                globalHandlers.splice(index, 1);
                return true;
            }
            return false;
        }
    };
}();