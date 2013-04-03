var routes = module.exports = {
    js: require('./js'),
    index: function(req, res) {
        res.sendfile('index.html')
    }
};