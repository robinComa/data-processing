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