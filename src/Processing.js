DataProcessing.Processing = DataProcessing.Class.extend({

    initialize: function (fn) {
        this._worker = new Worker('src/worker.js');
        this._worker.postMessage(fn.toString());

        var $scope = this;

        this._worker.onmessage = function (oEvent) {
            $scope._onFinish(oEvent.data);
        };

        return this;
    },

    onFinish: function(callback){
        this._onFinish = callback;

        return this;
    }

});

DataProcessing.processing = function (fn) {
    return new DataProcessing.Processing(fn);
};