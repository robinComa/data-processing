module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        connect: {
            all: {
                options:{
                    port: 9000,
                    hostname: "0.0.0.0",
                    middleware: function(connect, options) {
                        return [
                            require('grunt-contrib-livereload/lib/utils').livereloadSnippet,
                            connect.static(options.base)
                        ];
                    }
                }
            }
        },

        open: {
            all: {
                path: 'http://localhost:<%= connect.all.options.port%>'
            }
        },

        regarde: {
            all: {
                files:[
                    'index.html',
                    'docs/{,*/}*.html',
                    'src/{,*/}*.js'
                ],
                tasks: ['livereload']
            }
        }
    });

    grunt.registerTask('server',[
        'livereload-start',
        'connect',
        'open',
        'regarde'
    ]);
};