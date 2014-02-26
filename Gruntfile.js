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
                path: 'http://localhost:<%= connect.all.options.port%>/doc'
            }
        },

        regarde: {
            all: {
                files:[
                    'doc/{,*/}*.*',
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
                    cwd: '.tmp/',
                    dest: 'dist',
                    src: ['dataProcessing.js']
                },{
                    expand: true,
                    dot: true,
                    cwd: '',
                    dest: 'dist',
                    src: ['doc/{,*/}*.*']
                },{
                    expand: true,
                    dot: true,
                    cwd: '.tmp/concat/vendor/',
                    dest: 'dist/doc/vendor',
                    src: ['{,*/}{,*/}*.*']
                }]
            }
        },

        useminPrepare: {
            html: 'doc/*.html',
            options: {
                dest: 'dist/doc'
            }
        },

        usemin: {
            html: ['dist/doc/*.html'],
            options: {
                dirs: ['dist/doc']
            }
        },

        /** END OF Dist */

        /** Quality */

        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: ['src/**/*.js']
        },

        karma: {
            unit: {
                configFile: 'karma.conf.js',
                singleRun: true
            }
        },

        /** END OF Quality */

        /** GIT */

        'gh-pages': {
            options: {

            },
            'doc': {
                options: {
                    base: 'dist',
                    branch: 'gh-pages'
                },
                src: ['**']
            },
            'dist': {
                options: {
                    base: 'dist',
                    branch: 'master'
                },
                src: ['*']
            }
        }

        /** END OF GIT */

    });

    grunt.registerTask('server',[
        'livereload-start',
        'connect',
        'open',
        'regarde'
    ]);

    grunt.registerTask('dist',[
        'jshint',
        'karma:unit',
        'clean:dist',
        'useminPrepare',
        'concat',
        'copy:dist',
        'usemin',
        'gh-pages:doc',
        'gh-pages:dist'
    ]);

    grunt.registerTask('test',[
        'karma:unit'
    ]);

};