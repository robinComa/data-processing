'use strict';

var DataProcessing = {
    version: '0.0.0'
};

function expose() {
    var oldDataProcessing = window.DataProcessing;

    DataProcessing.noConflict = function () {
        window.DataProcessing = oldDataProcessing;
        return this;
    };

    window.DataProcessing = DataProcessing;
}

// define DataProcessing for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = DataProcessing;

// define DataProcessing as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(DataProcessing);

// define DataProcessing as a global L variable, saving the original L to restore later if needed
} else {
    expose();
}