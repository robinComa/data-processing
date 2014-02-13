'use strict';

DataProcessing.StoragePipe = DataProcessing.Pipe.extend({

    _PROCESSING_PIPE_KEY: 'DATA_PROCESSING : PROCESSING PIPE',
    _RESULT_PIPE_KEY: 'DATA_PROCESSING : RESULT PIPE',
    _INTERVAL_PROCESSING: 100,
    _INTERVAL_RESULT: 100,

    put: function(processings){
        var processingsQueue = this._getProcessings();

        if(processingsQueue === null){
            processingsQueue = [];
        }
        for(var i in processings){
            processingsQueue.push(processings[i].serialize());
        }
        this._setProcessings(processingsQueue);
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

    onProcessing: function(callback){
        var $scope = this;
        setInterval(function(){
            var processings = $scope._sliceProcessings();
            for(var i in processings){
                var processing = DataProcessing.Util.unSerialize(processings[i], DataProcessing.Processing);
                processing.onFinish(function(results){
                    $scope._pushResult(results);
                });
                callback(processing);
            }
        }, this.INTERVAL_PROCESSING);
        return this;
    },

    clear: function(){
        this._storage.removeItem(this._PROCESSING_PIPE_KEY);
        this._storage.removeItem(this._RESULT_PIPE_KEY);
        return this;
    },

    _sliceProcessings: function(){
        var processings = this._getProcessings();
        this._storage.removeItem(this._PROCESSING_PIPE_KEY);
        return processings;
    },

    _getProcessings: function(){
        return JSON.parse(this._storage.getItem(this._PROCESSING_PIPE_KEY))
    },

    _setProcessings: function(processings){
        this._storage.setItem(this._PROCESSING_PIPE_KEY, JSON.stringify(processings));
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