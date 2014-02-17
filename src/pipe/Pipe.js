'use strict';

DataProcessing.Pipe = DataProcessing.Class.extend({

    _id: DataProcessing.Util.guid(),

    put: function(processings){
        throw 'Pipe : you should implement put function';
    },

    onResult: function(callback){
        throw 'Pipe : you should implement onResult function';
    },

    onJob: function(callback){
        throw 'Pipe : you should implement onJob function';
    },

    clear: function(){
        throw 'Pipe : you should implement clear function';
    }

});