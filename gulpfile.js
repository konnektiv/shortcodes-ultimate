const fs = require('fs');
const del = require('del');
const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const babel = require('gulp-babel');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const nodeSass = require('node-sass');

function compileSASS() {
	sass.compiler = nodeSass;

	return gulp
		.src('./{includes,admin}/scss/*.scss')
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
		.src('./assets/js/*/src/*.js')
		.pipe(babel({ presets: ['@babel/env', '@babel/react'] }))
		.pipe(
			rename(function(path) {
				path.dirname += '/../';
			})
		)
		.pipe(uglify())
		.pipe(gulp.dest('./assets/js/'));
}

function watchFiles() {
	gulp.watch(
		['./includes/scss/**/*.scss', './admin/scss/**/*.scss'],
		compileSASS
	);
	gulp.watch('./assets/js/*/src/*.js', compileJS);
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

exports.sass = compileSASS;
exports.js = compileJS;
exports.watch = watchFiles;
exports.compile = gulp.parallel(compileSASS, compileJS);
exports.build = gulp.series(gulp.parallel(compileSASS, compileJS), createBuild);
