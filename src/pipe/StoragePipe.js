'use strict';

DataProcessing.StoragePipe = DataProcessing.Pipe.extend({

    _clear: function(){
        this._getStorage().removeItem(this.RESULT_PIPE_KEY + ' - ' + this._id);
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

    _pushResult: function(pipeId, result){
        var results = JSON.parse(this._getStorage().getItem(this.RESULT_PIPE_KEY + ' - ' + pipeId)) || [];
        results.push(result);
        this._getStorage().setItem(this.RESULT_PIPE_KEY + ' - ' + pipeId, JSON.stringify(results));
        return this;
    },

    _sliceResults: function(){
        var results = JSON.parse(this._getStorage().getItem(this.RESULT_PIPE_KEY + ' - ' + this._id)) || [];
        this._getStorage().removeItem(this.RESULT_PIPE_KEY + ' - ' + this._id);
        return results;
    }

});