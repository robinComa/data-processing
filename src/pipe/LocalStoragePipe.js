DataProcessing.LocalStoragePipe = DataProcessing.StoragePipe.extend({

    _getStorage: function(){
        return window.localStorage;
    }

});