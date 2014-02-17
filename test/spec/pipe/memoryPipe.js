'use strict';

describe('Class : MemoryPipe', function () {

    var TIMEOUT = 500;


    it('MemoryPipe should return jobs', function () {

        var pipe = new DataProcessing.MemoryPipe();

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

    it('MemoryPipe should return results', function () {

        var pipe = new DataProcessing.MemoryPipe();

        var callback = jasmine.createSpy();
        var j = new DataProcessing.Job([], function(){
            return;
        });

        pipe.put([j, j, j]);

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