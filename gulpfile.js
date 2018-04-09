var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var browserify = require('browserify');
//var browserify = require('gulp-browserify');
var clean_json = require("gulp-clean-json");
var replace = require('gulp-replace');
var uglify = require("gulp-uglify");
var source = require("vinyl-source-stream");
var buffer = require("vinyl-buffer");


var paths = {
  sass: ['./scss/**/*.scss'],
  tr: ['./src/posts/locales/*.json'],
  scripts: ['./src/**/*.js', './src/**/*.html']
  //browserify: ['./node_modules/steem-rpc/*.js']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/*.scss')
    .pipe(sass({
      errLogToConsole: true
    }))
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({extname: '.min.css'}))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('scripts', function(){
  browserify({
    entries: './src/app.js',
    debug: true,
    transform: ['brfs']
  })
  .bundle()
  .pipe(source('index.js'))
  .pipe(buffer())
  //.pipe(uglify())
  //.pipe(removeUseStrict())
  //.pipe(replace(/('|")use strict\1/g, ';'))
  .pipe(gulp.dest('./www/js'));

  gulp.src([
    './bower_components/jquery/dist/jquery.js',
    './bower_components/angular/angular.js',
    './bower_components/angular-animate/angular-animate.js',
    './bower_components/angular-sanitize/angular-sanitize.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/ionic/js/ionic.js',
    './bower_components/ionic/js/ionic-angular.js',
    './bower_components/ngstorage/ngStorage.js',
    './bower_components/ngCordova/dist/ng-cordova.js',
    './bower_components/angular-translate/angular-translate.js',
    './bower_components/ion-floating-menu/dist/ion-floating-menu.js',
    './bower_components/qrcode.js/lib/qrcode.js',
    './bower_components/angular-qr/src/angular-qr.js',
    './bower_components/highcharts-ng/dist/highcharts-ng.js',
    './bower_components/ionic-image-lazy-load/ionic-image-lazy-load.js'
    //'./bower_components/default-passive-events/default-passive-events.js'
  ])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('./www/js'));
});

/*gulp.task('scripts', function() {
  gulp.src('./src/app.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production,
      transform: ['brfs']
    }).on('error', gutil.log))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./www/js'));

  gulp.src([
    './bower_components/jquery/dist/jquery.js',
    './bower_components/angular/angular.js',
    './bower_components/angular-animate/angular-animate.js',
    './bower_components/angular-sanitize/angular-sanitize.js',
    './bower_components/angular-ui-router/release/angular-ui-router.js',
    './bower_components/ionic/js/ionic.js',
    './bower_components/ionic/js/ionic-angular.js',
    './bower_components/ngstorage/ngStorage.js',
    './bower_components/ngCordova/dist/ng-cordova.js',
    './bower_components/angular-translate/angular-translate.js',
    './bower_components/ion-floating-menu/dist/ion-floating-menu.js',
    './bower_components/qrcode.js/lib/qrcode.js',
    './bower_components/angular-qr/src/angular-qr.js',
    './bower_components/highcharts-ng/dist/highcharts-ng.js'
  ])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('./www/js'));
});
*/

gulp.task('clean_translations', function(done) {
  gulp.src("./src/posts/locales/*.json")
    .pipe(clean_json())
    .pipe(gulp.dest("./src/posts/locales/ready/"));
});
/*
gulp.task('browserify', function() {
  gulp.src('./node_modules/steem-rpc/*.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production,
      transform: ['brfs']
    }))
    .pipe(rename('esteem-lib.js'))
    .pipe(gulp.dest('./'));
});*/


gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.tr, ['clean_translations']);
  gulp.watch(paths.scripts, ['scripts']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
