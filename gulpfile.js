const fs = require('fs')
const del = require('del')
const gulp = require('gulp')
const sass = require('gulp-sass')
const autoprefixer = require('gulp-autoprefixer')
const babel = require('gulp-babel')
const rename = require('gulp-rename')
const uglify = require('gulp-uglify')
const nodeSass = require('node-sass')
const sassGlob = require('gulp-sass-glob')
const include = require('gulp-include')

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
}

function compileJS () {
  // [
  //   './includes/js/shortcodes/src/index.js',
  //   './includes/js/coder/src/block-editor.js',
  //   './includes/js/coder/src/index.js'
  // ]

  return gulp
    .src(['./*/js/*/src/*.js', '!./*/js/*/src/_*.js'], { base: './' })
    .pipe(include())
    .on('error', console.log)
    .pipe(
      babel({
        presets: [['@babel/env', { modules: false }], '@babel/react']
      })
    )
    .pipe(
      rename(function (path) {
        path.dirname += '/../'
      })
    )
    .pipe(uglify())
    .pipe(gulp.dest('./'))
}

function watchFiles () {
  gulp.watch('./*/scss/**/*.scss', compileSASS)
  gulp.watch('./*/js/*/src/*.js', compileJS)
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
    .src(['./**/*', `!${buildFolder}/**`, ...ignored])
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
