onmessage = function (oEvent) {

    var fn = eval('('+oEvent.data+')');

    setTimeout(function(){
        postMessage(fn());
    }, 1000);

};