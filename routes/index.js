var routes = module.exports = {
    js: require('./js'),
    index: function(req, res) {
        res.render('index', {title: 'Tttrio - a fast real-time multiplayer pattern-matching game to hone your logical skills'});
    },
    game: function(req, res) {
        res.sendfile('views/game.html');
    }
};