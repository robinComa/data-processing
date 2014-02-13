'use strict';

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
    URL: window.URL || window.webkitURL,

    unSerialize: function(serializedObj, objClass){
        var obj = eval('(' + atob(serializedObj) + ')');

        if(objClass === DataProcessing.Processing){
            return new objClass(obj.args, obj.fn);
        }

        throw 'unSerialize ERROR : Unsupported class.';
    },

    guid : function(){
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
    }
};

// shortcuts for most used utility functions
DataProcessing.extend = DataProcessing.Util.extend;
DataProcessing.bind = DataProcessing.Util.bind;
