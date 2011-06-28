var nurd = this.nurd = nurd || {};
(function() {
    nurd = this.nurd;
    var Model = nurd.Model = function() {
        
    };

    Model.prototype.update = function(data) {
        switch (data.type) {
        case 'gameUpdate' : $(this).trigger('gameUpdate', data);
            break;
        case 'playerRegistered' : console.log(data); $(this).trigger('playerRegistered', data);
            break;
        }
    };
})();