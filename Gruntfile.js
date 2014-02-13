module.exports = function(grunt) {

    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    grunt.initConfig({

        /** Server */

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
        },

        /** END OF Server */

        /** Dist */

        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        'dist/*',
                        '!dist/.git*'
                    ]
                }]
            }
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '',
                    dest: 'dist',
                    src: ['index.html']
                },{
                    expand: true,
                    dot: true,
                    cwd: '.tmp/concat/',
                    dest: 'dist',
                    src: ['dataProcessing.js']
                },{
                    expand: true,
                    dot: true,
                    cwd: '.tmp/concat/vendor/',
                    dest: 'dist/vendor',
                    src: ['{,*/}{,*/}*.*']
                }]
            }
        },

        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },

        usemin: {
            html: ['dist/index.html'],
            options: {
                dirs: ['dist']
            }
        },

        /** END OF Dist */

        /** Test */

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        }

        /** END OF Test */

    });

    grunt.registerTask('server',[
        'livereload-start',
        'connect',
        'open',
        'regarde'
    ]);

    grunt.registerTask('dist',[
        'clean:dist',
        'karma:unit',
        'useminPrepare',
        'concat',
        'copy:dist',
        'usemin'
    ]);

    grunt.registerTask('test',[
        'karma:unit'
    ]);

};