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

        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '',
                    dest: 'dist',
                    src: ['index.html']
                }]
            }
        },

        concat: {
            dist: {
                files: {
                    'dist/dataProcessing.js': [
                        '.tmp/concat/{,*/}*.js'
                    ]
                }
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

        uglify: {
            dist: {
                files: {
                    'dist/dataProcessing.min.js': ['dist/dataProcessing.js']
                }
            }
        }

        /** END OF Dist */

    });

    grunt.registerTask('dist',[
        'copy',
        'useminPrepare',
        'usemin',
        'concat',
        'uglify'
    ]);

    grunt.registerTask('server',[
        'livereload-start',
        'connect',
        'open',
        'regarde'
    ]);
};