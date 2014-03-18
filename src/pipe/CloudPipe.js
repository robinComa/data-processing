'use strict';

DataProcessing.CloudPipe = DataProcessing.Pipe.extend({

    _clear: function(){
        this.jobRef.remove();//TODO remove on check
        this.resultRef.child(this._id).remove();
        return this;
    },

    _pushJobs: function(jobs){

        this.jobRef = new Firebase('https://cloud-map-reduce-jobs-pipe.firebaseio.com/');
        var $scope = this;
        this.jobRef.on('value', function(snapshot) {
            var values = snapshot.val();
            for(var i in values){
                $scope._jobs.push(values[i]);
            }
        });
        this.resultRef = new Firebase('https://cloud-map-reduce-jobs-results.firebaseio.com/');
        this.resultRef.child(this._id).on('value', function(snapshot) {
            var values = snapshot.val();
            for(var i in values){
                $scope._results.push(values[i]);
            }
        });

        for(var i in jobs){
            this.jobRef.push(jobs[i].serialize());
        }
        return this;
    },

    _sliceJob: function(){
        var jobsSerialized = this._jobs;
        this._jobs = [];
        var jobs = [];
        for(var i in jobsSerialized){
            jobs.push(DataProcessing.Util.unSerialize(jobsSerialized[i], DataProcessing.Job));
        }
        return jobs;
    },

    _pushResult: function(pipeId, result){
        this.resultRef.child(this._id).push(result); //TODO pipeId & StoragePipe
        return this;
    },

    _sliceResults: function(){
        var results = this._results;
        this._results = [];
        return results;
    }

});