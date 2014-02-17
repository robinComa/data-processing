'use strict';

describe('Class : Job', function () {

    var TIMEOUT = 500;


    it('Worker should return a message', function () {

        var callback = jasmine.createSpy();
        var j = new DataProcessing.Job([], function(){
            return;
        });

        j.run();

        j.onFinish(callback);

        waitsFor(function() {
            return callback.callCount > 0;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

    it('Worker should return the message', function () {

        var message = null;

        var j = new DataProcessing.Job([], function(){
            return 'Yeah, I\'m a worker Message!';
        });

        j.run();

        j.onFinish(function(result){
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

        var j = new DataProcessing.Job([
            'param1',
            [0,1,2,3,{
                arg: 'Yeah! I\'m a deep arguments returned by the worker'
            }]
        ], function(param1, param2){
            return param2[4].arg;
        });

        j.run();

        j.onFinish(function(result){
            message = result;
        });

        waitsFor(function() {
            return message != null;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(message).toBe('Yeah! I\'m a deep arguments returned by the worker');
        });
    });

    it('Job should be serialize and unserialize', function () {

        var message = null;

        var j = new DataProcessing.Job([
            'param1',
            [0,1,2,3,{
                arg: 'Yeah! I\'m a deep arguments returned by the worker'
            }]
        ], function(param1, param2){
            return param2[4].arg;
        });

        var serial = j.serialize();

        var j2 = DataProcessing.Util.unSerialize(serial, DataProcessing.Job);

        j2.run();

        j2.onFinish(function(result){
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