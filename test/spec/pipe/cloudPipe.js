'use strict';

describe('Class : CloudPipe', function () {

    var TIMEOUT = 1000;


    it('CloudPipe should return jobs', function () {

        var callback = jasmine.createSpy();
        var callbackFinish = jasmine.createSpy();
        var j = new DataProcessing.Job([], function(){
            return "result as string";
        });

        var pipe = new DataProcessing.CloudPipe([j, j, j]);

        pipe.onJob(function(job){
            job.run();
            callback();
        });

        pipe.onResult(function(results){

        });

        pipe.onFinish(function(results){
            callbackFinish();
        });

        waitsFor(function() {
            return callback.callCount === 3 && callbackFinish.callCount > 0;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

    it('CloudPipe should return results', function () {

        var callback = jasmine.createSpy();
        var callbackFinish = jasmine.createSpy();

        var j = new DataProcessing.Job([], function(){
            return "result as string";
        });

        var pipe = new DataProcessing.CloudPipe([j, j, j]);

        pipe.onResult(callback);

        pipe.onFinish(function(results){
            callbackFinish();
        });

        pipe.onJob(function(job){
            job.run();
        });

        waitsFor(function() {
            return callback.callCount === 3 && callbackFinish.callCount > 0;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

});