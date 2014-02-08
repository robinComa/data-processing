'use strict';

DataProcessing.Processing = DataProcessing.Class.extend({

    initialize: function (args, fn) {
        this.args = args;
        this.userFn = fn.toString();
        this.fn = fn;
        return this;
    },

    run: function(){
        var blob = DataProcessing.Util.Blob([this._workerCodeCreation()], {
            type : 'text/javascript'
        });
        var domainScriptURL = DataProcessing.Util.URL.createObjectURL(blob);

        var worker = new Worker(domainScriptURL);
        var $scope = this;

        worker.onmessage = function (oEvent) {
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

    _workerCodeCreation: function(){
        var args = JSON.stringify(this.args);
        var code = this._workerScaffolding.toString();
        code = code.replace('null', this.fn.toString());
        code = code.replace('userCode()', 'userCode(' + args.slice(1, args.length - 1) + ')');
        return [
            '(',
            code,
            ')();'
        ].join('');
    },

    _workerScaffolding: function () {
        // Uses of this to keep userCode name on code minification
        this.userCode = null;
        postMessage(this.userCode());
    }

});