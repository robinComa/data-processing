'use strict';

DataProcessing.MemoryPipe = DataProcessing.Pipe.extend({

    _initialize: function(){
        if(!DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY]){
            DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY] = [];
        }
    },

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
        var results = DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY][this._id];
        DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY][this._id] = [];
        return results;
    }

});