'use strict';

DataProcessing.StoragePipe = DataProcessing.Pipe.extend({

    put: function(processings){
        var processingsQueue = this._getProcessings();
        if(processingsQueue === null){
            processingsQueue = [];
        }
        for(var i in processings){
            processingsQueue.push(processings[i].serialize());
        }
        this._setProcessings(processingsQueue);
        return this;
    },

    onProcessing: function(callback){
        var processings = this.clear();
        for(var i in processings){
            var processing = DataProcessing.Util.unSerialize(processings[i], DataProcessing.Processing);
            processing.onFinish(this._onResult);
            callback(processing);
        }
        return this;
    },

    clear: function(){
        var processings = this._getProcessings();
        this._storage.removeItem(this._id);
        return processings ? processings : [];
    },

    _getProcessings: function(){
        return JSON.parse(this._storage.getItem(this._id))
    },

    _setProcessings: function(processings){
        this._storage.setItem(this._id, JSON.stringify(processings));
    }

});