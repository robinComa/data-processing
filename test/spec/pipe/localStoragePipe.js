'use strict';

describe('Class : LocalStoragePipe', function () {

    var TIMEOUT = 500;

    it('LocalStoragePipe should return jobs', function () {

        var pipe = new DataProcessing.LocalStoragePipe();

        var callback = jasmine.createSpy();
        var j = new DataProcessing.Job([], function(){
            return;
        });

        pipe.put([j, j, j]);

        pipe.onJob(callback);

        waitsFor(function() {
            return callback.callCount === 3;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

    it('LocalStoragePipe should return results', function () {

        var pipe = new DataProcessing.LocalStoragePipe();

        var callback = jasmine.createSpy();
        var j = new DataProcessing.Job([], function(){
            return;
        });

        setTimeout(function(){
            pipe.put([j, j, j]);
        }, 100);

        pipe.onResult(callback);

        pipe.onJob(function(job){
            job.run();
        });

        waitsFor(function() {
            return callback.callCount === 3;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

});