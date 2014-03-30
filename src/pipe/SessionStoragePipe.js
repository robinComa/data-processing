DataProcessing.SessionStoragePipe = DataProcessing.StoragePipe.extend({

    _getStorage: function(){
        return window.sessionStorage;
    }

});