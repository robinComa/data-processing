'use strict';

describe('Class : Processing', function () {


    it("Worker should return a message", function () {

        var callback = jasmine.createSpy();
        DataProcessing.processing([], function(){
            return 'Yeah, I\'m a worker Message!';
        }).onFinish(callback);

        waitsFor(function() {
            return callback.callCount > 0;
        }, "The Worker end timed out.", 5000);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

});