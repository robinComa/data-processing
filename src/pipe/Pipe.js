'use strict';

DataProcessing.Pipe = DataProcessing.Class.extend({

    JOB_PIPE_KEY: 'DATA_PROCESSING : JOB PIPE',
    RESULT_PIPE_KEY: 'DATA_PROCESSING : RESULT PIPE',
    INTERVAL_JOB: 100,
    INTERVAL_RESULT: 100,

    initialize: function (jobs) {
        this._id = DataProcessing.Util.guid();
        this._results = [];
        this._results_length_target = jobs.length;
        this._pushJobs(jobs);
        return this;
    },

    onResult: function(callback){
        var $scope = this;
        this.onResultInterval = setInterval(function(){
            var results = $scope._sliceResults();
            for(var i in results){
                $scope._results.push(results[i]);
                callback(results[i]);
                if($scope._results.length === $scope._results_length_target){
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
            for (var i in jobs){
                jobs[i].onFinish(function(result){
                    $scope._pushResult(result)
                });
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
        throw 'Pipe : you should implement _pushJobs function';
    },

    _sliceJob: function(){
        throw 'Pipe : you should implement _sliceJob function';
    },

    _pushResult: function(result){
        throw 'Pipe : you should implement _pushResult function';
    },

    _sliceResults: function(){
        throw 'Pipe : you should implement _sliceResults function';
    }

});