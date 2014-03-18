'use strict';

DataProcessing.StoragePipe = DataProcessing.Pipe.extend({

    __getJobKey: function(){
        return this.JOB_PIPE_KEY + ' - ' + this._id;
    },

    __getResultKey: function(){
        return this.RESULT_PIPE_KEY + ' - ' + this._id;
    },

    _clear: function(){
        this._getStorage().removeItem(this.__getJobKey());
        this._getStorage().removeItem(this.__getResultKey());
        return this;
    },

    _getStorage: function(){
        throw 'Pipe : you should implement getStorage function';
    },

    _pushJobs: function(jobs){
        var jobsSerialized = JSON.parse(this._getStorage().getItem(this.__getJobKey())) || [];
        for(var i in jobs){
            jobsSerialized.push(jobs[i].serialize());
        }
        this._getStorage().setItem(this.__getJobKey(), JSON.stringify(jobsSerialized));
        return this;
    },

    _sliceJob: function(){
        var jobsSerialized = JSON.parse(this._getStorage().getItem(this.__getJobKey())) || [];
        var jobs = [];
        for(var i in jobsSerialized){
            jobs.push(DataProcessing.Util.unSerialize(jobsSerialized[i], DataProcessing.Job));
        }
        this._getStorage().removeItem(this.__getJobKey());
        return jobs;
    },

    _pushResult: function(pipeId, result){
        var results = JSON.parse(this._getStorage().getItem(this.__getResultKey())) || [];
        results.push(result);
        this._getStorage().setItem(this.__getResultKey(), JSON.stringify(results));
        return this;
    },

    _sliceResults: function(){
        var results = JSON.parse(this._getStorage().getItem(this.__getResultKey())) || [];
        this._getStorage().removeItem(this.__getResultKey());
        return results;
    }

});