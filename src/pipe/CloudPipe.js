'use strict';

DataProcessing.CloudPipe = DataProcessing.Pipe.extend({

    _clear: function(){
        this.RESULT_PIPE_KEY.child(this._id).remove();
        this.JOB_PIPE_KEY.off('child_added', this._onChildAdded);
        return this;
    },

    _pushJobs: function(jobs){

        this.__jobs = [];
        this.__results = [];

        this._onFirebase = function() {
            this.JOB_PIPE_KEY = new Firebase('https://cloud-map-reduce-jobs-pipe.firebaseio.com/');
            this.RESULT_PIPE_KEY = new Firebase('https://cloud-map-reduce-jobs-results.firebaseio.com/');

            var onJobAdded = function(snapshot){
                snapshot.ref().remove();
                this.__jobs.push(snapshot.val());
            };

            this.JOB_PIPE_KEY.startAt().limit(this.JOB_MAX_PARALLEL).on('child_added', onJobAdded.bind(this));

            var onResultAdded = function(snapshot){
                snapshot.ref().remove();
                this.__results.push(snapshot.val());
            };

            this.RESULT_PIPE_KEY.child(this._id).on('child_added', onResultAdded.bind(this));
            this.RESULT_PIPE_KEY.child(this._id).onDisconnect().remove();

            for(var i in jobs){
                this.JOB_PIPE_KEY.push(jobs[i].serialize());
            }
        };

        if(typeof Firebase === 'undefined'){
            var script = document.createElement('script');
            script.onload = this._onFirebase.bind(this);
            script.src = 'https://cdn.firebase.com/js/client/1.0.6/firebase.js';
            document.getElementsByTagName('head')[0].appendChild(script);
        }else{
            this._onFirebase();
        }

        return this;
    },

    _sliceJob: function(){
        var jobs = [];
        for(var i = 0; i < this.getMaxJob() && this.__jobs.length > 0; i++){
            jobs.push(DataProcessing.Util.unSerialize(this.__jobs.pop(), DataProcessing.Job));
        }
        return jobs;
    },

    _pushResult: function(pipeId, result){
        this.RESULT_PIPE_KEY.child(pipeId).push(result);
        return this;
    },

    _sliceResults: function(){
        var results = this.__results;
        this.__results = [];
        return results;
    }

});