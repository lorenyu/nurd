this.Player = function() {
    // Private class properties and functions
    var nextId = 1;

    return function() {
        this.id = 0;
        this.score = 0;
        this.numSets = 0;
        this.numFalseSets = 0;

        var _game = null;
        
        function init() {
            this.id = nextId;
            nextId += 1;
        }

        this.joinGame = function(game) {
            if (game.addPlayer(this)) {
                _game = game;
                return true;
            }
            return false;
        }

        this.set = function(cards) {
            if (!_game) {
                return;
            }

            if (_game.processSet(cards)) {
                this.score += 1;
                this.numSets += 1;
            } else {
                this.score -= 1;
                this.numFalseSets += 1;
            }
        }

        init.apply(this, arguments);
    }
}();
