this.EventEngine = function() {
    this._handlersByEventName = {};
    this._handlersByCallback = [];
    this._globalHandlers = [];
    this._handlersByChannel = {};
    this._eventTree = {};
    this._nextEventId = 1;
};

this.EventEngine.prototype.fire = function(eventName, eventData) {
    var eventName;
    var i, n;
    var event = { id: this._nextEventId, name: eventName, data: eventData};
    this._nextEventId += 1;
    //while (eventName) {
    var handlers = this._handlersByEventName[eventName];
    if (handlers) {
        for (i = 0, n = handlers.length; i < n; i += 1) {
            handlers[i](event);
        }
    }
    for (i = 0, n = this._handlersByCallback.length; i < n; i += 1) {
        var callback = this._handlersByCallback[i][0],
            handler = this._handlersByCallback[i][1];
        if (callback(event.name)) {
            handler(event);
        }
    }
    for (i = 0, n = this._globalHandlers.length; i < n; i += 1) {
        this._globalHandlers[i](event);
    }
};
this.EventEngine.prototype.observe = function(eventName, handler) {
    if (typeof(eventName) === 'string') {
        var handlers = this._handlersByEventName[eventName];
        if (!handlers) {
            handlers = []
            this._handlersByEventName[eventName] = handlers;
        }
        handlers.push(handler);
    } else if (typeof(eventName) === 'function') {
        this._handlersByCallback.push([eventName, handler]);
    }
};
this.EventEngine.prototype.observeAll = function(handler) {
    this._globalHandlers.push(handler);
};
this.EventEngine.prototype.observeChannel = function(channel, handler) {
    this.observe(function(eventName) {
        return eventName.indexOf(channel) === 0;
    }, handler);
};
this.EventEngine.prototype.stopObserving = function(eventName, handler) {
    var handlers = this._handlersByEventName[eventName],
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
};
this.EventEngine.prototype.stopObservingAll = function(handler) {
    var index = this._globalHandlers.indexOf(handler);
    if (index !== -1) {
        globalHandlers.splice(index, 1);
        return true;
    }
    return false;
};
