DataProcessing.Job = DataProcessing.Class.extend({

    initialize: function (args, fn) {
        this.args = args;
        this.fn = fn.toString();
        return this;
    },

    run: function(){
        var blob = DataProcessing.Util.Blob([this._workerCodeCreation()], {
            type : 'text/javascript'
        });
        var domainScriptURL = DataProcessing.Util.URL.createObjectURL(blob);

        var worker = new Worker(domainScriptURL);
        var $scope = this;

        DataProcessing.Job.NB_JOBS = (DataProcessing.Job.NB_JOBS || 0) + 1;

        worker.onmessage = function (oEvent) {
            DataProcessing.Job.NB_JOBS--;
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
        for(var apiKey in this._API){
            args = args.replace('"' + apiKey + '"', '(' + this._API[apiKey].toString() + ')()');
        }
        var code =
            this._workerScaffolding.toString()
                .replace(/['"]__fn__['"]/, this.fn)
                .replace(/['"]__args__['"]/, args);
        return [
            '(',
            code,
            ')();'
        ].join('');
    },

    _workerScaffolding: function () {
        postMessage('__fn__'.apply({}, '__args__'));
    },

    _API: {
        $http : function(){
            return {
                get: function(url){
                    var request = new XMLHttpRequest();
                    request.open('GET', url, false);  // `false` makes the request synchronous
                    request.send(null);
                    if (request.status === 200) {
                        /*jslint evil: true */
                        var response = eval('(' + request.responseText + ')');
                        /*jslint evil: false */
                        return response;
                    }
                }
            };
        }
    }

});