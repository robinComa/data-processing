// Karma configuration
module.exports = function (config) {
    config.set({
        basePath : '',

        frameworks : ['jasmine'],

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