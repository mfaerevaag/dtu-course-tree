var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    gulpif = require('gulp-if'),
    rename = require('gulp-rename'),
    browserify = require('gulp-browserify'),
    minimist = require('minimist');

var args = minimist(process.argv.slice(2), { default: { dist: 'dist' }});

var app_root = 'app';
var dist_root = args.dist;

// dev

gulp.task('connect', function() {
    connect.server({
        root: dist_root,
        livereload: true
    });
});

gulp.task('reload', ['build'], function () {
    gulp.src(dist_root + '/*.html')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch([
        app_root + '/**/*.{html,css,js}',
        'index.html'
    ], ['reload']);
});

gulp.task('default', ['build', 'connect', 'watch']);


// build

gulp.task('styles', function () {
    var styles = [
        app_root + '/styles/**/*.css',
        'vendor/bootstrap/dist/css/bootstrap.css',
    ];

    return gulp.src(styles)
        .pipe(concat('styles.css'))
        .pipe(gulp.dest(dist_root));
});

gulp.task('js', function () {
    return gulp.src('app/Main.js')
        .pipe(browserify({
            paths: ['app'],
            shim: {
                angular: {
                    path: 'vendor/angular/angular.js',
                    exports: 'angular'
                },

                'angular-route': {
                    path: 'vendor/angular-route/angular-route.js',
                    exports: 'ngRoute',
                    depends: { angular: 'angular' }
                },

                'angular-strap-tpl': {
                    path: 'vendor/angular-strap/dist/angular-strap.tpl.js',
                    exports: 'ngStrapTpl',
                    depends: { angular: 'angular' }
                },

                'angular-strap': {
                    path: 'vendor/angular-strap/dist/angular-strap.js',
                    exports: 'ngStrap',
                    depends: { angular: 'angular' }
                },

                jquery: {
                    path: 'vendor/jquery/dist/jquery.js',
                    exports: 'jQuery'
                },

                d3: {
                    path: 'vendor/d3/d3.js',
                    exports: 'd3',
                    depends: { jquery: 'jquery' }
                },
                
                lodash: {
                    path: 'vendor/lodash/dist/lodash.js',
                    exports: '_'
                },

                bootstrap: {
                    path: 'vendor/bootstrap/dist/js/bootstrap.js',
                    exports: 'bootstrap',
                    depends: { jquery: 'jquery' }
                }
            }
        }))
        .pipe(concat('bundle.js'))
        .pipe(gulp.dest(dist_root));
});

gulp.task('clean', function () {
    return gulp.src(dist_root)
        .pipe(clean());
});

gulp.task('copy', function () {
    return gulp.src(['index.html', 'app/view/**', 'data/**'], { base: './' })
        .pipe(gulp.dest(dist_root));
});

gulp.task('build', ['js', 'styles', 'copy']);
