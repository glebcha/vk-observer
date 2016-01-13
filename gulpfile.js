'use strict';

const   env = process.env.NODE_ENV,
		gulp = require('gulp'),
		gulpif = require('gulp-if'),
		cache = require('gulp-cache'),
		clean = require('gulp-rimraf'),
		stream = require('event-stream'),
		browserSync = require('browser-sync'),
		babel = require('gulp-babel'),
		browserify = require('browserify'),
		babelify = require('babelify'),
		uglify = require('gulp-uglify'),
		source = require('vinyl-source-stream'),
		sourcemaps = require('gulp-sourcemaps'),
		size = require('gulp-size'),
		jshint = require('gulp-jshint'),
		concat = require('gulp-concat'),
		minifyCSS = require('gulp-minify-css'),
		base64 = require('gulp-base64'),
		imagemin = require('gulp-imagemin'),
		less = require('gulp-less'),
		jade = require('gulp-jade'),
		rename = require('gulp-rename'),
		notify = require("gulp-notify"),
		pluginAutoprefix = require('less-plugin-autoprefix');

const autoprefix = new pluginAutoprefix({ browsers: ["Chrome >= 30"] });

gulp.task('html', () => {
	let localsObject = {};

	gulp.src('source/views/*.jade')
	.pipe(jade({
	  locals: localsObject,
	  pretty: true
	}))
	.pipe(gulp.dest(''))
	.pipe(browserSync.reload({stream:true}));
});

gulp.task('styles', () => {
	return gulp.src('source/less/*.less')
		.pipe(less({
			plugins: [autoprefix]
		}))
		.on("error", notify.onError({
			message: 'LESS compile error: <%= error.message %>'
		}))
		.pipe(base64({
			extensions: ['jpg', 'png', 'svg'],
			maxImageSize: 32*1024 
		}))
		.pipe(minifyCSS({
			keepBreaks: false 
		}))
		.pipe(gulp.dest('css'))
		.pipe(size({
			title: 'size of styles'
		}))
		.pipe(browserSync.reload({stream:true}));
});
 
gulp.task('scripts', () => {
	let modules = browserify('source/js/app/app.js', {
			debug: env === "development" ? true : false
		})
		.transform(babelify, {presets: ["es2015"]})
		.bundle()
		.on("error", notify.onError({
			message: 'Browserify error: <%= error.message %>'
		}))
		.pipe(source('vk-observer.js'))
		.pipe(gulp.dest('js'))
		.pipe(size({
			title: 'size of modules'
		}));
	let deps = gulp.src('source/js/libs/*')
		.pipe(concat('libs.js'))
		.pipe(uglify())
		.pipe(gulp.dest('js'))
		.pipe(size({
			title: 'size of js dependencies'
		}));
	let pages = gulp.src('source/js/pages/*.js')
		.pipe(gulpif(env === "development", sourcemaps.init()))
		.pipe(babel({
			presets: ['es2015']
		}))
		.on("error", notify.onError({
			message: 'Babel error: <%= error.message %>'
		}))
		.pipe(gulpif(env === "development", sourcemaps.write()))
		.pipe(gulp.dest('js'))
		.pipe(size({
			title: 'size of modules'
		}));
	stream.concat(modules, deps, pages);
});

gulp.task('images', () => {
	return gulp.src(['source/images/*', '!source/images/*.db'])
		.pipe(cache(imagemin({
			optimizationLevel: 5,
			progressive: true,
			interlaced: true
		})))
		.on("error", notify.onError({
			message: 'Images processing error: <%= error.message %>'
		}))
		.pipe(gulp.dest('images'))
		.pipe(size({
			title: 'size of images'
		}));
});

gulp.task('clean', () => {
  return gulp.src(['css', 'js', '*.html'], {read: false})
	.pipe(clean());
});

gulp.task('clear', (done) => {
  return cache.clearAll(done);
});

gulp.task('watch', () => {
	gulp.watch('source/views/**/*.jade', ['html']);
	gulp.watch('source/js/**/*.js', ['scripts']);
	gulp.watch('source/less/**/*.less', ['styles']);
	gulp.watch('source/images/*', ['images']);
});

gulp.task('default', ['clean', 'clear'], () => {
	gulp.start('styles', 'scripts', 'images', 'html');
});
