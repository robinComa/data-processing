'use strict';

DataProcessing.MemoryPipe = DataProcessing.Pipe.extend({

    _processings: [],

    initialize: function () {
        if(!DataProcessing.MemoryPipe.PIPE){
            DataProcessing.MemoryPipe.PIPE = [];
        }
        return this;
    },

    put: function(processings){
        DataProcessing.MemoryPipe.PIPE = processings.concat(this._getProcessings());
        return this;
    },

    onResult: function(callback){
        DataProcessing.MemoryPipe.ON_RESULTS = callback;
        return this;
    },

    onProcessing: function(callback){
        var processings = this._sliceProcessing();
        for(var i in processings){
            var processing = processings[i];
            processing.onFinish(DataProcessing.MemoryPipe.ON_RESULTS);
            callback(processing);
        }
        return this;
    },

    clear: function(){
        DataProcessing.MemoryPipe.PIPE = [];
    },

    _getProcessings: function(){
        return DataProcessing.MemoryPipe.PIPE;
    },

    _setProcessings: function(processings){
        DataProcessing.MemoryPipe.PIPE = processings;
    },

    _sliceProcessing: function(){
        var processings = this._getProcessings();
        this.clear();
        return processings;
    }

});