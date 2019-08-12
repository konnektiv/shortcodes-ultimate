const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const nodeSass = require('node-sass');
const include = require('gulp-include');

function compileSASS() {
	sass.compiler = nodeSass;

	return gulp
		.src('./*/scss/*.scss')
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer({ cascade: false }))
		.pipe(
			gulp.dest(function(file) {
				let relative = file.path
					.replace(file.base, '')
					.replace('/scss/', '/css/');

				file.path = file.base + relative;

				return '.';
			})
		);
}

function compileJS() {
	return gulp
		.src(['./*/js/*/src/*.js', '!./*/js/*/src/_*.js'], { base: './' })
		.pipe(include())
		.on('error', console.log)
		.pipe(babel({ presets: ['@babel/env', '@babel/react'] }))
		.pipe(
			rename(function(path) {
				path.dirname += '/../';
			})
		)
		.pipe(uglify())
		.pipe(gulp.dest('./'));
}

function watchFiles() {
	gulp.watch('./*/scss/**/*.scss', compileSASS);
	gulp.watch('./*/js/*/src/*.js', compileJS);
}

function createBuild() {
	let ignored = fs
		.readFileSync('.buildignore', 'utf8')
		.split(/\r\n|\n|\r/)
		.filter(item => {
			if (item && item.indexOf('//') !== 0) {
				return '!' + item;
			}
		})
		.map(item => '!' + item);

	let buildFolder = './build';

	del.sync([buildFolder]);

	return gulp
		.src(['./**/*', `!${buildFolder}/**`, ...ignored])
		.pipe(gulp.dest(buildFolder));
}

function createShortcodesFull() {
	sass.compiler = nodeSass;

	return gulp
		.src('./includes/scss/shortcodes.scss')
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({ cascade: false }))
		.pipe(rename('shortcodes.full.css'))
		.pipe(gulp.dest('./includes/css/'));
}

exports.sass = compileSASS;
exports.js = compileJS;
exports.watch = watchFiles;
exports.compile = gulp.parallel(compileSASS, compileJS, createShortcodesFull);
exports.build = gulp.series(gulp.parallel(compileSASS, compileJS, createShortcodesFull), createBuild);
