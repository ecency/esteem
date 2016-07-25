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
  scripts: ['./src/**/*.js', './src/**/*.html']
};

gulp.task('default', ['sass']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('scripts', function() {
  gulp.src(['./src/app.js','./src/controllers.js','./src/services.js'])
    .pipe(browserify({
      insertGlobals : true,
      debug : !gulp.env.production,
      transform: ['brfs']
    }))
    .pipe(rename('index.js'))
    .pipe(gulp.dest('./www/js'));

  gulp.src([
    './src/lib/ionic/js/ionic-bundle.js',
    './src/lib/jquery.js',
    './src/lib/ngCordova.js',
    './src/lib/ngStorage.js',
    './node_modules/steemjs-lib/dist/index.js',
    './node_modules/steem-rpc/build/steem-rpc.js'
    //'./bower_components/cordova-facebook-connect-plugin/lib/cordova-facebook-connect-plugin.js'
  ])
  .pipe(concat('lib.js'))
  .pipe(gulp.dest('./www/js'));
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
