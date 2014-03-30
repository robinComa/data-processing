DataProcessing.MapReduce = DataProcessing.Class.extend({

    initialize: function (PipeImplementationClass) {
        this._PipeImplementationClass = PipeImplementationClass;
        return this;
    },

    addCollection: function(collection){
        this._collection = (collection instanceof Array) ? collection : collection();
        return this;
    },

    map: function(mapFunction){
        this._map = mapFunction;
        return this;
    },

    reduce: function(reduceFunction){
        this._reduce = reduceFunction;
        return this;
    },

    then: function(callbackResolve, callbackReject, callbackNotify){

        var jobs = [];
        for(var i in this._collection){
            var arg = this._collection[i];
            var job  = new DataProcessing.Job([arg], this._map);
            jobs.push(job);
        }

        var pipe = new this._PipeImplementationClass(jobs);

        pipe.onJob(function(job){
            job.run();
        });
        pipe.onResult(callbackNotify);
        var onFinish = function(results){
            var job  = new DataProcessing.Job([results, this._reduce.toString()], function(results, reduceFunction){
                var result = {};
                /*jslint evil: true */
                reduceFunction = eval('(' + reduceFunction + ')');
                /*jslint evil: false */
                for(var i in results){
                    result = reduceFunction(results[i], result);
                }
                return result;
            });

            job.onFinish(function(result){
                callbackResolve(result);
            });

            job.run();
        };
        pipe.onFinish(onFinish.bind(this));
        return this;
    }

});