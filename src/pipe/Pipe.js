'use strict';

DataProcessing.Pipe = DataProcessing.Class.extend({

    JOB_PIPE_KEY: 'DATA_PROCESSING : JOB PIPE',
    RESULT_PIPE_KEY: 'DATA_PROCESSING : RESULT PIPE',
    INTERVAL_JOB: 100,
    INTERVAL_RESULT: 100,

    JOB_MAX: 2,

    initialize: function (jobs) {
        var id = this._id = DataProcessing.Util.guid();
        this._results = [];
        this._resultsLengthTarget = jobs.length;
        this._pushJobs(jobs.map(function(job){
            job._pipeId = id;
            return job;
        }));
        return this;
    },

    onResult: function(callback){
        var $scope = this;
        this.onResultInterval = setInterval(function(){
            var results = $scope._sliceResults();
            for(var i in results){
                $scope._results.push(results[i]);
                callback(results[i]);
                if($scope._results.length === $scope._resultsLengthTarget){
                    $scope.onFinish($scope._results);
                    $scope.clear();
                }
            }
        }, this.INTERVAL_RESULT);
        return this;
    },

    onFinish: function(callback){
        this.onFinish = callback;
        return this;
    },

    onJob: function(callback){
        var $scope = this;
        this.onJobInterval = setInterval(function(){
            var jobs = $scope._sliceJob();
            var onFinish = function(pipeId){
                return function(result){
                    $scope._pushResult(pipeId, result);
                };
            };
            for (var i in jobs){
                var pipeId = jobs[i]._pipeId;
                jobs[i].onFinish(onFinish(pipeId));
                callback(jobs[i]);
            }
        }, this.INTERVAL_JOB);
        return this;
    },

    clear: function(){
        if(this._clear){
            this._clear();
            this._results = [];
            clearInterval(this.onResultInterval);
            clearInterval(this.onJobInterval);
        }else{
            throw 'Pipe : you should implement _clear function';
        }
    },

    _pushJobs: function(jobs){
        throw 'Pipe : you should implement _pushJobs function with jobs arg : ' + jobs.toString();
    },

    _sliceJob: function(){
        throw 'Pipe : you should implement _sliceJob function';
    },

    _pushResult: function(result){
        throw 'Pipe : you should implement _pushResult function with result arg : ' + result.toString();
    },

    _sliceResults: function(){
        throw 'Pipe : you should implement _sliceResults function';
    }

});