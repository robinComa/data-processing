'use strict';

DataProcessing.MemoryPipe = DataProcessing.Pipe.extend({

    _processings: [],

    initialize: function () {
        return this;
    },

    put: function(processings){
        this._processings = processings;
        return this;
    },

    onProcessing: function(callback){
        for(var i in this._processings){
            var processing = this._processings[i];
            processing.onFinish(this._onResult)
            callback(processing);
        }
        return this;
    },

    clear: function(){
        var processings = this._processings;
        this._processings = [];
        return processings;
    }

});