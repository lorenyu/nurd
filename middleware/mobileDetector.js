var mobileDetector = module.exports = function(req, res, next){ 
    var ua = req.header('user-agent');
    if(/mobile/i.test(ua)) {
        req.isMobile = true;
    } else {
        req.isMobile = false;
    }
    next();
};
