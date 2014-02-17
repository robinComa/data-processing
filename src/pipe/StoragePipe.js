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