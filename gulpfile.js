var gulp = require('gulp'),
    connect = require('gulp-connect'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify');

var public_root  = 'public';

// dev

gulp.task('connect', function() {
    connect.server({
        root: public_root,
        livereload: true
    });
});

gulp.task('html', function () {
    gulp.src(public_root + '/*.html')
        .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch([public_root + '/**/*.{html,css,js}'], ['html']);
});


gulp.task('default', ['connect', 'watch']);

// build

gulp.task('copy', function () {

});
