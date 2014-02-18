'use strict';

DataProcessing.MemoryPipe = DataProcessing.Pipe.extend({

    _clear: function(){
        delete DataProcessing.MemoryPipe[this.JOB_PIPE_KEY];
        delete DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY];
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

    _pushResult: function(result){
        DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY].push(result);
        return this;
    },

    _sliceResults: function(){
        var results = DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY];
        DataProcessing.MemoryPipe[this.RESULT_PIPE_KEY] = [];
        return results;
    }

});