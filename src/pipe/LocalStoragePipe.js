'use strict';

DataProcessing.LocalStoragePipe = DataProcessing.StoragePipe.extend({

    initialize: function () {
        this._storage = window.localStorage;
        return this;
    }

});