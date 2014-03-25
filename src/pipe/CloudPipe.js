'use strict';

DataProcessing.CloudPipe = DataProcessing.Pipe.extend({

    _clear: function(){
        console.log('clear')
        this.RESULT_PIPE_KEY.child(this._id).remove();
        this.JOB_PIPE_KEY.off('child_added', this._onChildAdded);
        return this;
    },

    _pushJobs: function(jobs){
        this._jobs = [];
        this._results = [];
        var $scope = this;

        var pushResult = function(result){
            $scope._results.push(result);
        };

        var onFirebase = function() {
            $scope.JOB_PIPE_KEY = new Firebase('https://cloud-map-reduce-jobs-pipe.firebaseio.com/');
            $scope.RESULT_PIPE_KEY = new Firebase('https://cloud-map-reduce-jobs-results.firebaseio.com/');

            $scope._onChildAdded = function(snapshot){
                snapshot.ref().remove();
                $scope._jobs.push(snapshot.val());
            };

            $scope.JOB_PIPE_KEY.startAt().limit($scope.JOB_MAX).on('child_added', $scope._onChildAdded);


            $scope.RESULT_PIPE_KEY.child($scope._id).on('child_added', function(snapshot) {
                snapshot.ref().remove();
                pushResult(snapshot.val());// TODO $scope._results is never re-initialized by _sliceResults (this._results = [];)
                console.log('->', $scope._results.length)
            });
            $scope.RESULT_PIPE_KEY.child($scope._id).onDisconnect().remove();

            for(var i in jobs){
                $scope.JOB_PIPE_KEY.push(jobs[i].serialize());
            }
        };

        if(typeof Firebase === 'undefined'){
            var script = document.createElement('script');
            script.onload = function(){
                onFirebase();
            };
            script.src = 'https://cdn.firebase.com/js/client/1.0.6/firebase.js';
            document.getElementsByTagName('head')[0].appendChild(script);
        }else{
            onFirebase();
        }

        return this;
    },

    _sliceJob: function(){
        var jobs = [];
        for(var i = 0; i < this.JOB_MAX && this._jobs.length > 0; i++){
            jobs.push(DataProcessing.Util.unSerialize(this._jobs.pop(), DataProcessing.Job));
        }
        return jobs;
    },

    _pushResult: function(pipeId, result){
        console.log(pipeId)
        this.RESULT_PIPE_KEY.child(pipeId).push(result);
        return this;
    },

    _sliceResults: function(){
        var results = this._results;
        this._results = [];
        console.log(results.length, this._results.length)
        return results;
    }

});