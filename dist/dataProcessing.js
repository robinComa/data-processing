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

// define DataProcessing as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(DataProcessing);

// define DataProcessing as a global L variable, saving the original L to restore later if needed
} else {
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
            var bb = new(window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder)();
            bb.append(args);
            return bb.getBlob(option.type);
        }
    },

    // URL cross browser
    URL: window.URL || window.webkitURL,

    unSerialize: function(serializedObj, objClass){
        var obj = eval('(' + atob(serializedObj) + ')');

        if(objClass === DataProcessing.Job){
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

    _id: DataProcessing.Util.guid(),

    put: function(processings){
        throw 'Pipe : you should implement put function';
    },

    onResult: function(callback){
        throw 'Pipe : you should implement onResult function';
    },

    onJob: function(callback){
        throw 'Pipe : you should implement onJob function';
    },

    clear: function(){
        throw 'Pipe : you should implement clear function';
    }

});
'use strict';

DataProcessing.MemoryPipe = DataProcessing.Pipe.extend({

    _jobs: [],

    initialize: function () {
        if(!this._getJobs()){
            this._setJobs([]);
        }
        return this;
    },

    put: function(jobs){
        this._setJobs(jobs.concat(this._getJobs()));
        return this;
    },

    onResult: function(callback){
        DataProcessing.MemoryPipe.ON_RESULTS = callback;
        return this;
    },

    onJob: function(callback){
        var jobs = this._sliceJob();
        for(var i in jobs){
            var job = jobs[i];
            job.onFinish(DataProcessing.MemoryPipe.ON_RESULTS);
            callback(job);
        }
        return this;
    },

    clear: function(){
        this._setJobs([]);
        return this;
    },

    _getJobs: function(){
        return DataProcessing.MemoryPipe.PIPE;
    },

    _setJobs: function(jobs){
        DataProcessing.MemoryPipe.PIPE = jobs;
        return this;
    },

    _sliceJob: function(){
        var jobs = this._getJobs();
        this.clear();
        return jobs;
    }

});
'use strict';

DataProcessing.StoragePipe = DataProcessing.Pipe.extend({

    _JOB_PIPE_KEY: 'DATA_PROCESSING : JOB PIPE',
    _RESULT_PIPE_KEY: 'DATA_PROCESSING : RESULT PIPE',
    _INTERVAL_JOB: 100,
    _INTERVAL_RESULT: 100,

    put: function(jobs){
        var jobsQueue = this._getJobs();

        if(jobsQueue === null){
            jobsQueue = [];
        }
        for(var i in jobs){
            jobsQueue.push(jobs[i].serialize());
        }
        this._setJobs(jobsQueue);
        return this;
    },

    onResult: function(callback){
        var $scope = this;
        setInterval(function(){
            var results =  $scope._sliceResults();
            for (var i in results){
                callback(results[i]);
            }
        }, this._INTERVAL_RESULT);
        return this;
    },

    onJob: function(callback){
        var $scope = this;
        setInterval(function(){
            var jobs = $scope._sliceJobs();
            for(var i in jobs){
                var job = DataProcessing.Util.unSerialize(jobs[i], DataProcessing.Job);
                job.onFinish(function(results){
                    $scope._pushResult(results);
                });
                callback(job);
            }
        }, this._INTERVAL_JOB);
        return this;
    },

    clear: function(){
        this._storage.removeItem(this._JOB_PIPE_KEY);
        this._storage.removeItem(this._RESULT_PIPE_KEY);
        return this;
    },

    _sliceJobs: function(){
        var jobs = this._getJobs();
        this._storage.removeItem(this._JOB_PIPE_KEY);
        return jobs;
    },

    _getJobs: function(){
        return JSON.parse(this._storage.getItem(this._JOB_PIPE_KEY))
    },

    _setJobs: function(jobs){
        this._storage.setItem(this._JOB_PIPE_KEY, JSON.stringify(jobs));
        return this;
    },

    _getResults: function(){
        var results = JSON.parse(this._storage.getItem(this._RESULT_PIPE_KEY));
        return results ? results : [];
    },

    _setResults: function(results){
        this._storage.setItem(this._RESULT_PIPE_KEY, JSON.stringify(results));
    },

    _sliceResults: function(){
        var results = this._getResults();
        this._storage.removeItem(this._RESULT_PIPE_KEY);
        return results;
    },

    _pushResult: function(result){
        var results = this._getResults();
        results.push(result);
        this._setResults(results);
    }

});
'use strict';

DataProcessing.LocalStoragePipe = DataProcessing.StoragePipe.extend({

    initialize: function () {
        this._storage = window.localStorage;
        return this;
    }

});
'use strict';

DataProcessing.SessionStoragePipe = DataProcessing.StoragePipe.extend({

    initialize: function () {
        this._storage = window.sessionStorage;
        return this;
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
                        return eval('(' + request.responseText + ')');
                    }
                }
            };
        }
    }

});