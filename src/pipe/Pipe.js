'use strict';

DataProcessing.Pipe = DataProcessing.Class.extend({

    _id: DataProcessing.Util.guid(),

    put: function(processings){
        throw 'Pipe : you should implement put function';
    },

    onResult: function(callback){
        this._onResult = callback;
        return this;
    },

    onProcessing: function(callback){
        throw 'Pipe : you should implement onProcessing function';
    },

    clear: function(){
        throw 'Pipe : you should implement clear function';
    }

});