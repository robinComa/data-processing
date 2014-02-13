(function(){

    var pipe = new DataProcessing.MemoryPipe();
    //var pipe = new DataProcessing.SessionStoragePipe();
    //var pipe = new DataProcessing.LocalStoragePipe();

    //pipe.clear();

    var words = [
        'titi',
        'tutu',
        'toto'
    ];
    var processings = [];

    for(var i in words){
        var processing = new DataProcessing.Processing([
            'f71dbe52628a3f83a77ab494817525c6',
            words[i],
            'http://ip.jsontest.com/',
            'http://time.jsontest.com/',
            'http://md5.jsontest.com/?text=',
            '$http'
        ], function(target_md5, tested_word, url_ip, url_date, url_md5, $http){
            var md5 = $http.get(url_md5 + tested_word).md5;
            if(md5 === target_md5){
                var ip = $http.get(url_ip);
                var date = $http.get(url_date);
                ip.date = date.milliseconds_since_epoch;
                return ip;
            }
            return null;
        });
        processings.push(processing);
    }



    pipe.put(processings);

    pipe.onResult(function(result){
        console.log(result);
    });

    return;
    pipe.onProcessing(function(processing){
        processing.run();
    });

})();
(function(){
    //return;
    var pipe = new DataProcessing.MemoryPipe();
    //var pipe = new DataProcessing.SessionStoragePipe();
    //var pipe = new DataProcessing.LocalStoragePipe();

    pipe.onProcessing(function(processing){
        processing.run();
    });

})();