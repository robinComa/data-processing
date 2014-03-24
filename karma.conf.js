// Karma configuration
module.exports = function (config) {
    config.set({
        basePath : '',

        // Fix for "JASMINE is not supported anymore" warning
        frameworks : ["jasmine"],

        files : [
            'src/copyright.js',
            'src/DataProcessing.js',
            'src/core/Utils.js',
            'src/core/Class.js',
            'src/pipe/Pipe.js',
            'src/pipe/MemoryPipe.js',
            'src/pipe/StoragePipe.js',
            'src/pipe/LocalStoragePipe.js',
            'src/pipe/SessionStoragePipe.js',
            'src/pipe/CloudPipe.js',
            'src/job/Job.js',
            'test/spec/**/*.js'
        ],

        autoWatch : true,

        // Start these browsers, currently available:
        // - Chrome
        // - ChromeCanary
        // - Firefox
        // - Opera
        // - Safari (only Mac)
        // - PhantomJS
        // - IE (only Windows)
        browsers : ['PhantomJS']

    });
};