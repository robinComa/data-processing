'use strict';

DataProcessing.SessionStoragePipe = DataProcessing.StoragePipe.extend({

    initialize: function () {
        this._storage = window.sessionStorage;
        return this;
    }

});