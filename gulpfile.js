var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var browserify = require('gulp-browserify');

var paths = {
  sass: ['./scss/**/*.scss'],
  scripts: ['./src/**/*.js', './src/**/*.html'],
  browserify: ['./node_modules/steem-rpc/*.js', './node_modules/steemjs-lib/*.js']
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

gulp.task('scripts', function() {
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
    './bower_components/angular-qr/src/angular-qr.js'
  ])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('./www/js'));
});

gulp.task('browserify', function() {
  gulp.src('./node_modules/steemjs-lib/dist/index.js')
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production,
      transform: ['brfs']
    }))
    .pipe(rename('steemjs-lib.js'))
    .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
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
