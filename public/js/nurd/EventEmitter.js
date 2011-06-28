(function(){
    var nurd = this.nurd;
    var EventEmitter = nurd.EventEmitter = function(){
    };
    EventEmitter.prototype.emit = function(eventName, eventData) {
        $(this).trigger(eventName, eventData);
    };
    EventEmitter.prototype.on = function(eventName, callback) {
        $(this).bind(eventName, callback);
    };
})();