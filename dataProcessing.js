/*
 DataProcessing, a JS library for multi-threaded data processing. https://github.com/robinComa/data-processing
 (c) 2014-2014 Robin Coma Delperier, (c)
 */
'use strict';

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
} else {// define DataProcessing as a global L variable, saving the original L to restore later if needed
    expose();
}
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
            var BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder;
            var bb = new BlobBuilder();
            bb.append(args);
            return bb.getBlob(option.type);
        }
    },

    // URL cross browser
    URL: window.URL || window.webkitURL,

    unSerialize: function(serializedObj, ObjClass){
        /*jslint evil: true */
        var obj = eval('(' + atob(serializedObj) + ')');
        /*jslint evil: false */

        if(ObjClass === DataProcessing.Job){
            return new ObjClass(obj.args, obj.fn);
        }

        throw 'unSerialize ERROR : Unsupported class.';
    },

    guid : function(){
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        return (S4()+S4()+'-'+S4()+'-'+S4()+'-'+S4()+'-'+S4()+S4()+S4());
    }
};

// shortcuts for most used utility functions
DataProcessing.extend = DataProcessing.Util.extend;
DataProcessing.bind = DataProcessing.Util.bind;

'use strict';

/*
 * DataProcessing.Class powers the OOP facilities of the library.
 * Thanks to John Resig and Dean Edwards for inspiration!
 */

DataProcessing.Class = function () {};

DataProcessing.Class.extend = function (props) {

    /** Serialize Object */
    this.prototype.serialize = function(){
        return btoa(JSON.stringify(this));
    };

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
    // jshint camelcase: true

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
'use strict';

DataProcessing.Pipe = DataProcessing.Class.extend({

    JOB_PIPE_KEY: 'DATA_PROCESSING : JOB PIPE',
    RESULT_PIPE_KEY: 'DATA_PROCESSING : RESULT PIPE',
    INTERVAL_JOB: 100,
    INTERVAL_RESULT: 100,

    initialize: function (jobs) {
        var id = this._id = DataProcessing.Util.guid();
        this._results = [];
        this._resultsLengthTarget = jobs.length;
        this._pushJobs(jobs.map(function(job){
            job._pipeId = id;
            return job;
        }));
        return this;
    },

    onResult: function(callback){
        var $scope = this;
        this.onResultInterval = setInterval(function(){
            var results = $scope._sliceResults();
            for(var i in results){
                $scope._results.push(results[i]);
                callback(results[i]);
                if($scope._results.length === $scope._resultsLengthTarget){
                    $scope.onFinish($scope._results);
                    $scope.clear();
                }
            }
        }, this.INTERVAL_RESULT);
        return this;
    },

    onFinish: function(callback){
        this.onFinish = callback;
        return this;
    },

    onJob: function(callback){
        var $scope = this;
        this.onJobInterval = setInterval(function(){
            var jobs = $scope._sliceJob();
            var onFinish = function(result){
                $scope._pushResult(pipeId, result);
            };
            for (var i in jobs){
                var pipeId = jobs[i]._pipeId;
                jobs[i].onFinish(onFinish);
                callback(jobs[i]);
            }
        }, this.INTERVAL_JOB);
        return this;
    },

    clear: function(){
        if(this._clear){
            this._clear();
            this._results = [];
            clearInterval(this.onResultInterval);
            clearInterval(this.onJobInterval);
        }else{
            throw 'Pipe : you should implement _clear function';
        }
    },

    _pushJobs: function(jobs){
        throw 'Pipe : you should implement _pushJobs function with jobs arg : ' + jobs.toString();
    },

    _sliceJob: function(){
        throw 'Pipe : you should implement _sliceJob function';
    },

    _pushResult: function(result){
        throw 'Pipe : you should implement _pushResult function with result arg : ' + result.toString();
    },

    _sliceResults: function(){
        throw 'Pipe : you should implement _sliceResults function';
    }

});
'use strict';

DataProcessing.MemoryPipe = DataProcessing.Pipe.extend({

    _clear: function(){
        //delete DataProcessing.MemoryPipe[this.JOB_PIPE_KEY];
        delete DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY][this._id];
        return this;
    },

    _pushJobs: function(jobs){
        if(!DataProcessing.MemoryPipe[this.JOB_PIPE_KEY]){
            DataProcessing.MemoryPipe[this.JOB_PIPE_KEY] = [];
        }
        DataProcessing.MemoryPipe[this.JOB_PIPE_KEY] = DataProcessing.MemoryPipe[this.JOB_PIPE_KEY].concat(jobs);
        return this;
    },

    _sliceJob: function(){
        var jobs = [];
        var MAX = 2;
        for(var i = 0; i < MAX && DataProcessing.MemoryPipe[this.JOB_PIPE_KEY].length > 0; i++){
            jobs.push(DataProcessing.MemoryPipe[this.JOB_PIPE_KEY].pop());
        }
        return jobs;
    },

    _pushResult: function(pipeId, result){
        DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY][pipeId].push(result);
        return this;
    },

    _sliceResults: function(){
        if(!DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY]){
            DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY] = [];
        }
        var results = DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY][this._id];
        DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY][this._id] = [];
        return results;
    }

});
'use strict';

DataProcessing.StoragePipe = DataProcessing.Pipe.extend({

    _clear: function(){
        this._getStorage().removeItem(this.JOB_PIPE_KEY);
        this._getStorage().removeItem(this.RESULT_PIPE_KEY);
        return this;
    },

    _getStorage: function(){
        throw 'Pipe : you should implement getStorage function';
    },

    _pushJobs: function(jobs){
        var jobsSerialized = JSON.parse(this._getStorage().getItem(this.JOB_PIPE_KEY)) || [];
        for(var i in jobs){
            jobsSerialized.push(jobs[i].serialize());
        }
        this._getStorage().setItem(this.JOB_PIPE_KEY, JSON.stringify(jobsSerialized));
        return this;
    },

    _sliceJob: function(){
        var jobsSerialized = JSON.parse(this._getStorage().getItem(this.JOB_PIPE_KEY)) || [];
        var jobs = [];
        for(var i in jobsSerialized){
            jobs.push(DataProcessing.Util.unSerialize(jobsSerialized[i], DataProcessing.Job));
        }
        this._getStorage().removeItem(this.JOB_PIPE_KEY);
        return jobs;
    },

    _pushResult: function(result){
        var results = JSON.parse(this._getStorage().getItem(this.RESULT_PIPE_KEY)) || [];
        results.push(result);
        this._getStorage().setItem(this.RESULT_PIPE_KEY, JSON.stringify(results));
        return this;
    },

    _sliceResults: function(){
        var results = JSON.parse(this._getStorage().getItem(this.RESULT_PIPE_KEY)) || [];
        this._getStorage().removeItem(this.RESULT_PIPE_KEY);
        return results;
    }

});
'use strict';

DataProcessing.LocalStoragePipe = DataProcessing.StoragePipe.extend({

    _getStorage: function(){
        return window.localStorage;
    }

});
'use strict';

DataProcessing.SessionStoragePipe = DataProcessing.StoragePipe.extend({

    _getStorage: function(){
        return window.sessionStorage;
    }

});
'use strict';

DataProcessing.Job = DataProcessing.Class.extend({

    initialize: function (args, fn) {
        this.args = args;
        this.fn = fn.toString();
        return this;
    },

    run: function(){
        var blob = DataProcessing.Util.Blob([this._workerCodeCreation()], {
            type : 'text/javascript'
        });
        var domainScriptURL = DataProcessing.Util.URL.createObjectURL(blob);

        var worker = new Worker(domainScriptURL);
        var $scope = this;

        worker.onmessage = function (oEvent) {
            if($scope._onFinish){
                $scope._onFinish(oEvent.data);
            }else{
                throw 'You should attach a "onFinish" callback function';
            }
        };

        return this;
    },

    onFinish: function(callback){
        this._onFinish = callback;
        return this;
    },

    _workerCodeCreation: function(){
        var args = JSON.stringify(this.args);
        for(var apiKey in this._API){
            args = args.replace('"' + apiKey + '"', '(' + this._API[apiKey].toString() + ')()');
        }
        var code =
            this._workerScaffolding.toString()
                .replace('\'__fn__\'', this.fn)
                .replace('\'__args__\'', args);
        return [
            '(',
            code,
            ')();'
        ].join('');
    },

    _workerScaffolding: function () {
        postMessage('__fn__'.apply({}, '__args__'));
    },

    _API: {
        $http : function(){
            return {
                get: function(url){
                    var request = new XMLHttpRequest();
                    request.open('GET', url, false);  // `false` makes the request synchronous
                    request.send(null);
                    if (request.status === 200) {
                        /*jslint evil: true */
                        var response = eval('(' + request.responseText + ')');
                        /*jslint evil: false */
                        return response;
                    }
                }
            };
        }
    }

});