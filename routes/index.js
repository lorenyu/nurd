var routes = module.exports = {
    js: require('./js'),
    index: function(req, res) {
        res.render('index');
    },
    game: function(req, res) {
        res.sendfile('views/game.html');
    }
};