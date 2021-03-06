const del = require('del');
const gulp = require('gulp');
const runs = require('run-sequence');
const glps = require('gulp-load-plugins');

const $ = glps();

const srcFolder = 'src';
const outFolder = 'build';
const configFolder = 'config';
const releaseFolder = 'release';

const replaceEnvVar = (variable) => $.stringReplace(`<${variable}>`, process.env[variable]);

module.exports = (done) => {
  process.env.NODE_ENV = 'production';
  runs('prod:clean', 'prod:build', 'prod:views', 'prod:release', done);
}


gulp.task('prod:build', (done) => {
  runs(['prod:scripts', 'prod:styles', 'prod:fonts', 'prod:images', 'prod:assets', 'prod:flags'], done);
});

gulp.task('prod:clean', (done) => {
  return del(`${outFolder}`, { force: true });
});

gulp.task('prod:scripts', ['prod:config'], function () {
  return gulp.src(`${srcFolder}/scripts/**/*.js`)
    .pipe($.babel({ presets: ['latest'] }))
    .pipe($.ngAnnotate())
    .pipe($.concat('main.js'))
    .pipe(gulp.dest(`${outFolder}/scripts`));
});

gulp.task('prod:config', function () {
  return gulp.src(`${configFolder}/${process.env.NODE_ENV}.js`)
    .pipe(replaceEnvVar('MUMUKI_BIBLIOTHECA_URL'))
    .pipe(replaceEnvVar('MUMUKI_AUTH0_DOMAIN'))
    .pipe(replaceEnvVar('MUMUKI_AUTH0_CLIENT_ID'))
    .pipe($.concat('config.js'))
    .pipe(gulp.dest(`${srcFolder}/scripts/config`));
});

gulp.task('prod:styles', function () {
  return gulp.src(`${srcFolder}/styles/**/*.scss`)
    .pipe($.sass.sync())
    .pipe(gulp.dest(`${outFolder}/styles`));
});

gulp.task('prod:views', (done) => {
  runs(['prod:views:index', 'prod:views:jade'], done);
});

gulp.task('prod:fonts', function () {
  const fonts = [
    `${srcFolder}/fonts/**/*`,
    `${srcFolder}/bower_components/dev-awesome/dist/fonts/**/*`,
    `${srcFolder}/bower_components/font-awesome/fonts/**/*`,
    `${srcFolder}/bower_components/bootstrap-sass/assets/fonts/**/*`
  ]
  return gulp.src(fonts)
    .pipe(gulp.dest(`${outFolder}/fonts`));
});

gulp.task('prod:assets', function () {
  return gulp.src(`${srcFolder}/assets/**/*`)
    .pipe(gulp.dest(`${outFolder}/assets/`));
});

gulp.task('prod:views:index', () => {
  return gulp.src(`${srcFolder}/index.jade`)
    .pipe($.pug())
    .pipe($.wiredep({ includeSelf: true }))
    .pipe($.usemin({
      js: [$.rev],
      css: [$.rev],
      es6: [$.uglify, $.rev],
      scss: [$.minifyCss, $.rev]
    }))
    .pipe(gulp.dest(`${outFolder}`));
});

gulp.task('prod:views:jade', () => {
  return gulp.src(`${srcFolder}/views/**/*.jade`)
    .pipe($.pug())
    .pipe(gulp.dest(`${outFolder}/views`));
});

gulp.task('prod:images', function () {
  return gulp.src(`${srcFolder}/images/**/*`)
    .pipe(gulp.dest(`${outFolder}/images`));
});

gulp.task('prod:flags', function () {
  return gulp.src(`${srcFolder}/bower_components/flag-icon-css/flags/**/*`)
    .pipe(gulp.dest(`${outFolder}/flags`));
});

gulp.task('prod:release', ['prod:release:clean'], function () {
  return gulp.src(`${outFolder}/**/*`)
    .pipe(gulp.dest(`${releaseFolder}`));
});

gulp.task('prod:release:clean', function () {
  return del(`${releaseFolder}`, { force: true });
});

gulp.task('prod:serve', () => {
  gulp
    .src(`${releaseFolder}`)
    .pipe($.webserver({
      open: true,
      port: 8080,
      host: 'editor.localmumuki.io',
      livereload: true
    }));
});
