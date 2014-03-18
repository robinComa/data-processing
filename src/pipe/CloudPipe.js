'use strict';

DataProcessing.CloudPipe = DataProcessing.Pipe.extend({

    _clear: function(){
        this.RESULT_PIPE_KEY.child(this._id).remove();
        return this;
    },

    _pushJobs: function(jobs){
        var $scope = this;
        $scope._jobs = [];
        $scope._results = [];

        if(typeof Firebase === "undefined"){
            var script = document.createElement('script');
            script.onload = function() {
                $scope.JOB_PIPE_KEY = new Firebase('https://cloud-map-reduce-jobs-pipe.firebaseio.com/');
                $scope.RESULT_PIPE_KEY = new Firebase('https://cloud-map-reduce-jobs-results.firebaseio.com/');

                $scope.JOB_PIPE_KEY.on('child_added', function(snapshot) {
                    $scope._jobs.push(snapshot.val());
                    snapshot.ref().remove();
                });
                $scope.RESULT_PIPE_KEY.child($scope._id).on('child_added', function(snapshot) {
                    $scope._results.push(snapshot.val());
                });

                for(var i in jobs){
                    $scope.JOB_PIPE_KEY.push(jobs[i].serialize());
                }
            };
            script.src = 'https://cdn.firebase.com/js/client/1.0.6/firebase.js';
            document.getElementsByTagName('head')[0].appendChild(script);
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
        this.RESULT_PIPE_KEY.child(pipeId).push(result);
        return this;
    },

    _sliceResults: function(){
        var results = this._results;
        this._results = [];
        return results;
    }

});