var jade = require('jade');

// define jade filter
var placeholder = module.exports.filter = function(str, attrs) {
    var placeholder = jade.filters.placeholder,
        name;
    attrs = attrs || {};
    name = attrs.define;
    name = name.substr(1, name.length-2); // remove leading and trailing quotes
    if (name) {
        placeholder.data[name] = jade.render(str.replace(/\\n/g, '\n'));
    }
    return '';
};
placeholder.data = {};

// define app helper
var helper = module.exports.helper = function(name) {
    return placeholder.data[name];
};