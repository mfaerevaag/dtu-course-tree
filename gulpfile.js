var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean');

var public_root = 'public';
var dist_root   = gulp.env.dist || 'dist';

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
    gulp.watch([public_root + '/**/*.{html,css,js}'], ['reload']);
});

gulp.task('default', ['connect', 'watch']);


// build

gulp.task('clean', function () {
    return gulp.src(dist_root)
        .pipe(clean());
});

gulp.task('copy', ['clean'], function () {
    return gulp.src(public_root + '/**')
        .pipe(gulp.dest(dist_root));
});

gulp.task('build', ['copy']);
