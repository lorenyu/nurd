var nurd = this.nurd = nurd || {};
(function(){
    var nurd = this.nurd;
    nurd.util = {
        /**
         * Inherit the prototype methods from one constructor into another.
         *
         * Example:
         *
         *     function foo(){};
         *     foo.prototype.hello = function(){ console.log( this.words )};
         *     
         *     function bar(){
         *       this.words = "Hello world";
         *     };
         *     
         *     io.util.inherit(bar,foo);
         *     var person = new bar();
         *     person.hello();
         *     // => "Hello World"
         *
         * @param {Constructor} ctor The constructor that needs to inherit the methods.
         * @param {Constructor} superCtor The constructor to inherit from.
         * @api public
         */
        inherit: function(ctor, superCtor){
            // no support for `instanceof` for now
            for (var i in superCtor.prototype){
                ctor.prototype[i] = superCtor.prototype[i];
            }
        },
        
        Crypto: {
            getRandomKey: function() {
                return Math.floor(1e12 * Math.random());
            }
        }
    };
})();