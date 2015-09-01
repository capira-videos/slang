var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var reload = browserSync.reload;


// Build process (concat and minify)

function slangTask(slang) {
    return gulp.src(['src/' + slang + '/**/*.js', '!src/' + slang + '/demo'])
        .pipe(concat('' + slang + '.js'))
        .pipe(gulp.dest('dist/' + slang + '/'))
        .pipe(uglify())
        .pipe(rename('' + slang + '.min.js'))
        .pipe(gulp.dest('dist/' + slang + '/'));
}

gulp.task('mathslang', function() {
    return slangTask('mathslang');
});

gulp.task('colors', function() {
    return slangTask('colors');
});

gulp.task('hausdorff-metric', function() {
    return slangTask('hausdorff-metric');
});

gulp.task('langslang', function() {
    return slangTask('langslang');
});

gulp.task('logicslang', function() {
    return slangTask('logicslang');
});

gulp.task('slang', function() {
    return gulp.src(['dist/**/*.js','!slang'])
        .pipe(concat('slang.js'))
        .pipe(gulp.dest('dist/slang/'))
        .pipe(uglify())
        .pipe(rename('slang.min.js'))
        .pipe(gulp.dest('dist/slang/'));
});


gulp.task('default', ['mathslang', 'colors', 'hausdorff-metric', 'langslang', 'logicslang'] );

// Watch Files For Changes & Reload
gulp.task('serve', ['mathslang', 'colors', 'hausdorff-metric', 'langslang', 'logicslang'], function() {
    browserSync({
        notify: false,
        logPrefix: 'CAPIRA',
        snippetOptions: {
            rule: {
                match: '<span id="browser-sync-binding"></span>',
                fn: function(snippet) {
                    return snippet;
                }
            }
        },
        // Run as an https by uncommenting 'https: true'
        // Note: this uses an unsigned certificate which on first access
        //       will present a certificate warning in the browser.
        // https: true,
        server: {
            baseDir: 'src',
            directory: true,
            routes: {
                '/bower_components': 'bower_components',
                '/dist': 'dist'
            }
        }
    });

    gulp.watch(['src/**/*.html'], reload);
    gulp.watch(['src/styles/**/*.css'], ['styles', reload]);
    gulp.watch(['src/elements/**/*.css'], ['elements', reload]);
    gulp.watch(['src/{scripts,elements}/**/*.js'], ['jshint']);
    gulp.watch(['src/images/**/*'], reload);
});
