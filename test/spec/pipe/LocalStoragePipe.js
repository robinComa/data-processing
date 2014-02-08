'use strict';

describe('Class : LocalStoragePipe', function () {

    var TIMEOUT = 500;


    it('LocalStoragePipe should return processings', function () {

        var pipe = new DataProcessing.LocalStoragePipe();

        var callback = jasmine.createSpy();
        var p = new DataProcessing.Processing([], function(){
            return;
        });

        pipe.put([p,p,p]);

        pipe.onProcessing(callback);

        waitsFor(function() {
            return callback.callCount == 3;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

    it('LocalStoragePipe should return results', function () {

        var pipe = new DataProcessing.LocalStoragePipe();

        var callback = jasmine.createSpy();
        var p = new DataProcessing.Processing([], function(){
            return;
        });

        pipe.put([p,p,p]);

        pipe.onResult(callback);

        pipe.onProcessing(function(processing){
            processing.run();
        });

        waitsFor(function() {
            return callback.callCount == 3;
        }, 'The Worker end timed out.', TIMEOUT);

        runs(function() {
            expect(callback).toHaveBeenCalled();
        });
    });

});