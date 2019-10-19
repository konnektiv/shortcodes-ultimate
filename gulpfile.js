var fs = require('fs')
var del = require('del')
var gulp = require('gulp')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')
var rename = require('gulp-rename')
var nodeSass = require('node-sass')
var sassGlob = require('gulp-sass-glob')
var uglify = require('gulp-uglify')
var sourcemaps = require('gulp-sourcemaps')
var browserify = require('browserify')
var babelify = require('babelify')
var tap = require('gulp-tap')
var buffer = require('gulp-buffer')
var yargv = require('yargs').argv
var gulpif = require('gulp-if')
var livereload = require('gulp-livereload')

function compileSASS () {
  sass.compiler = nodeSass

  return gulp
    .src('./*/scss/*.scss', { base: './' })
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      rename(function (path) {
        path.dirname = path.dirname.replace('/scss', '/css')
      })
    )
    .pipe(gulp.dest('./'))
    .pipe(livereload())
}

function compileJS () {
  return gulp
    .src([
      './includes/js/block-editor/src/index.js',
      './includes/js/generator/src/index.js',
      './includes/js/shortcodes/src/index.js'
    ], { read: false, base: './' })
    .pipe(tap(function (file) {
      file.contents = browserify(file.path, { debug: true })
        .transform(babelify.configure({ presets: ['@babel/env', '@babel/react'] }))
        .bundle()
    }))
    .pipe(buffer())
    .pipe(rename(path => { path.dirname += '/../' }))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(gulpif(!yargv.nouglify, uglify()))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./'))
    .pipe(livereload())
}

function watchFiles () {
  livereload.listen({
    host: 'localhost',
    port: 35729,
    quiet: true
  })
  gulp.watch('./*/scss/**/*.scss', compileSASS)
  gulp.watch('./*/js/*/src/**/*.js', compileJS)
}

function createBuild () {
  const ignored = fs
    .readFileSync('.buildignore', 'utf8')
    .split(/\r\n|\n|\r/)
    .filter(item => {
      if (item && item.indexOf('//') !== 0) {
        return '!' + item
      }
    })
    .map(item => '!' + item)

  const buildFolder = './build'

  del.sync([buildFolder])

  return gulp
    .src(['./**/*', '!' + buildFolder + '/**', ...ignored])
    .pipe(gulp.dest(buildFolder))
}

function createShortcodesFull () {
  sass.compiler = nodeSass

  return gulp
    .src('./includes/scss/shortcodes.scss')
    .pipe(sassGlob())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(rename('shortcodes.full.css'))
    .pipe(gulp.dest('./includes/css/'))
}

exports.sass = compileSASS
exports.js = compileJS
exports.watch = watchFiles
exports.compile = gulp.parallel(compileSASS, compileJS, createShortcodesFull)
exports.build = gulp.series(
  gulp.parallel(compileSASS, compileJS, createShortcodesFull),
  createBuild
)
