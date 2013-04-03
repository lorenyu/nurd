var routes = module.exports = {
    js: require('./js'),
    index: function(req, res) {
        res.sendfile('index.html')
    },
    game: function(req, res) {
        res.sendfile('views/game.html')
    }
};