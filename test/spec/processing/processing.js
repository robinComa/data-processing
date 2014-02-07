'use strict';

describe('Class : Processing', function () {

    var TIMEOUT = 500;


    it('Worker should return a message', function () {

        var callback = jasmine.createSpy();
        DataProcessing.processing([], function(){
            return;
        }).onFinish(callback);

        waitsFor(function() {
            return callback.callCount > 0;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

    it('Worker should return the message', function () {

        var message = null;

        DataProcessing.processing([], function(){
            return 'Yeah, I\'m a worker Message!';
        }).onFinish(function(result){
            message = result;
        });

        waitsFor(function() {
            return message != null;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(message).toBe('Yeah, I\'m a worker Message!');
        });
    });

    it('Worker should accept deep parameters', function () {

        var message = null;

        DataProcessing.processing([
            'param1',
            [0,1,2,3,{
                arg: 'Yeah! I\'m a deep arguments returned by the worker'
            }]
        ], function(param1, param2){
            return param2[4].arg;
        }).onFinish(function(result){
            message = result;
        });

        waitsFor(function() {
            return message != null;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(message).toBe('Yeah! I\'m a deep arguments returned by the worker');
        });
    });

});