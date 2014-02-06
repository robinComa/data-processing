/*
 DataProcessing, a JS library for multi-threaded data processing. https://github.com/robinComa/data-processing
 (c) 2014-2014 Robin Coma Delperier, (c)
 */
var DataProcessing = {
    version: '0.0.0'
};

function expose() {
    var oldDataProcessing = window.DataProcessing;

    DataProcessing.noConflict = function () {
        window.DataProcessing = oldDataProcessing;
        return this;
    };

    window.DataProcessing = DataProcessing;
}

// define DataProcessing for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = DataProcessing;

// define DataProcessing as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(DataProcessing);

// define DataProcessing as a global L variable, saving the original L to restore later if needed
} else {
    expose();
}
/*
 * DataProcessing.Util contains various utility functions used throughout Leaflet code.
 */

DataProcessing.Util = {
    // extend an object with properties of one or more other objects
    extend: function (dest) {
        var sources = Array.prototype.slice.call(arguments, 1),
            i, j, len, src;

        for (j = 0, len = sources.length; j < len; j++) {
            src = sources[j];
            for (i in src) {
                dest[i] = src[i];
            }
        }
        return dest;
    },

    // create an object from a given prototype
    create: Object.create || (function () {
        function F() {}
        return function (proto) {
            F.prototype = proto;
            return new F();
        };
    })(),

    // bind a function to be called with a given context
    bind: function (fn, obj) {
        var slice = Array.prototype.slice;

        if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
        }

        var args = slice.call(arguments, 2);

        return function () {
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
        };
    },

    // Blob cross browser
    Blob: function(args, option){
        if(typeof(Blob) === typeof(Function)){
            return new window.Blob(args, option);
        }else{
            var bb = new(window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder)();
            bb.append(args);
            return bb.getBlob(option.type);
        }
    },

    // URL cross browser
    URL: window.URL || window.webkitURL
};

// shortcuts for most used utility functions
DataProcessing.extend = DataProcessing.Util.extend;
DataProcessing.bind = DataProcessing.Util.bind;

/*
 * DataProcessing.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

DataProcessing.Class = function () {};

DataProcessing.Class.extend = function (props) {

    // extended class with the new prototype
    var NewClass = function () {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        if (this._initHooks.length) {
            this.callInitHooks();
        }
    };

    // jshint camelcase: false
    var parentProto = NewClass.__super__ = this.prototype;

    var proto = DataProcessing.Util.create(parentProto);
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    //inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        DataProcessing.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        DataProcessing.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (proto.options) {
        props.options = DataProcessing.Util.extend(DataProcessing.Util.create(proto.options), props.options);
    }

    // mix given properties into the prototype
    DataProcessing.extend(proto, props);

    proto._initHooks = [];

    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled) { return; }

        if (parentProto.callInitHooks) {
            parentProto.callInitHooks.call(this);
        }

        this._initHooksCalled = true;

        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].call(this);
        }
    };

    return NewClass;
};


// method for adding properties to prototype
DataProcessing.Class.include = function (props) {
    DataProcessing.extend(this.prototype, props);
};

// merge new default options to the Class
DataProcessing.Class.mergeOptions = function (options) {
    DataProcessing.extend(this.prototype.options, options);
};

// add a constructor hook
DataProcessing.Class.addInitHook = function (fn) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push(init);
};
DataProcessing.Processing = DataProcessing.Class.extend({

    initialize: function (args, fn) {

        var workerCode = [
            '(',
            this._workerScaffolding.toString().replace('postMessage()', 'postMessage(('+fn.toString()+')())'),
            ')();'
        ].join('');

        var oblob = DataProcessing.Util.Blob([workerCode], { type : 'text/javascript' });
        var domainScriptURL = DataProcessing.Util.URL.createObjectURL(oblob);

        this._worker = new Worker(domainScriptURL);

        var $scope = this;

        this._worker.onmessage = function (oEvent) {
            $scope._onFinish(oEvent.data);
        };

        return this;
    },

    onFinish: function(callback){
        this._onFinish = callback;
        return this;
    },

    _workerScaffolding: function () {
        setTimeout(function(){
            postMessage();//replaced by the user code
        }, 1000);
    }

});

DataProcessing.processing = function (args, fn) {
    return new DataProcessing.Processing(args, fn);
};