'use strict';

var gulp = require('gulp');

var jshint = require('gulp-jshint');
var plumber = require('gulp-plumber');
var concat = require('gulp-concat');
var stripDebug = require('gulp-strip-debug');
var uglify = require('gulp-uglify');
var livereload = require('gulp-livereload');
var openBrowser = require('gulp-open');
var karma = require('gulp-karma');
var ghPages = require('gulp-gh-pages');
var replace = require('gulp-replace');

var bower = require('./bower.json');

gulp.task('scripts', function() {
    gulp.src([
        'src/copyright.js',
        'src/DataProcessing.js',
        'src/core/Utils.js',
        'src/core/Class.js',
        'src/job/Job.js',
        'src/pipe/Pipe.js',
        'src/pipe/MemoryPipe.js',
        'src/pipe/StoragePipe.js',
        'src/pipe/SessionStoragePipe.js',
        'src/pipe/LocalStoragePipe.js',
        'src/pipe/CloudPipe.js',
        'src/mapreduce/MapReduce.js'
    ])
        .pipe(concat(bower.name + '.js'))
        .pipe(plumber())
        .pipe(stripDebug())
        .pipe(replace(/\@build\.version/g, bower.version))
        .pipe(replace(/\@build\.date/g, new Date().toString()))
        .pipe(gulp.dest('dist'));

    gulp.src(['dist/' + bower.name + '.js'])
        .pipe(concat(bower.name + '.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist'));
});

gulp.task('staticsvr', function(next) {
    var staticS = require('node-static'),
        server = new staticS.Server('./'),
        port = 9000;
    require('http').createServer(function (request, response) {
        request.addListener('end', function () {
            server.serve(request, response);
        }).resume();
    }).listen(port, function() {
        next();
    });
});

gulp.task('watch', function() {
    var lr = livereload();
    gulp.watch('src/**').on('change', function(file) {
        gulp.run('scripts');
        lr.changed(file.path);
    });
    return gulp.watch('doc/**').on('change', function(file) {
        lr.changed(file.path);
    });
});

gulp.task('open', function(){
    gulp.src('./doc/index.html')
        .pipe(openBrowser('', {
            url: 'http://localhost:9000/doc',
            app: 'google-chrome'
        }));
});

gulp.task('karma', function(){
    gulp.src([
        'test/polyfill.js',
        'dist/' + bower.name + '.min.js',
        'test/spec/**/*.js'
    ])
        .pipe(karma({configFile: 'karma.conf.js'}));
});

gulp.task('distDoc', function(){
    gulp.src('dist/**/*')
        .pipe(ghPages(bower.repository.url, 'gh-pages'));
});

gulp.task('distSrc', function(){
    gulp.src('dist/*')
        .pipe(jshint())
        .pipe(ghPages(bower.repository.url, 'master'));
});

gulp.task('serve', ['scripts', 'staticsvr', 'watch', 'open']);
gulp.task('test', ['karma']);
gulp.task('dist', ['scripts', 'distDoc', 'distSrc']);