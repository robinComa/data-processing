'use strict';

DataProcessing.Processing = DataProcessing.Class.extend({

    initialize: function (args, fn) {
        var blob = DataProcessing.Util.Blob([this._workerCodeCreation(args, fn)], {
            type : 'text/javascript'
        });
        var domainScriptURL = DataProcessing.Util.URL.createObjectURL(blob);

        this._worker = new Worker(domainScriptURL);
        var $scope = this;

        this._worker.onmessage = function (oEvent) {
            if($scope._onFinish){
                $scope._onFinish(oEvent.data);
            }else{
                throw 'You should attach a "onFinish" callback function';
            }
        };
        return this;
    },

    onFinish: function(callback){
        this._onFinish = callback;
        return this;
    },

    _workerCodeCreation: function(args, fn){
        args = JSON.stringify(args);
        var code = this._workerScaffolding.toString();
        code = code.replace('null', fn.toString());
        code = code.replace('userCode()', 'userCode(' + args.slice(1, args.length - 1) + ')');
        return [
            '(',
            code,
            ')();'
        ].join('');
    },

    _workerScaffolding: function () {
        var userCode = null;
        postMessage(userCode());
    }

});

DataProcessing.processing = function (args, fn) {
    return new DataProcessing.Processing(args, fn);
};