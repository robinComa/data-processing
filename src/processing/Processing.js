DataProcessing.Processing = DataProcessing.Class.extend({

    initialize: function (args, fn) {

        var workerCode = [
            '(',
            this._workerScaffolding.toString().replace('postMessage()', 'postMessage(('+fn.toString()+')())'),
            ')();'
        ].join('');

        var oblob = new Blob([workerCode], { "type" : "text\/javascript" });
        var domainScriptURL = URL.createObjectURL(oblob);

        this._worker = new Worker(domainScriptURL);

        var $scope = this;

        this._worker.onmessage = function (oEvent) {
            $scope._onFinish(oEvent.data);
        };

        return this;
    },

    onFinish: function(callback){
        this._onFinish = callback;
        return this;
    },

    _workerScaffolding: function () {
        setTimeout(function(){
            postMessage();//replaced by the user code
        }, 1000);
    }

});

DataProcessing.processing = function (args, fn) {
    return new DataProcessing.Processing(args, fn);
};