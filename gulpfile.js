var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var browserSync = require('browser-sync');
var reload = browserSync.reload;


// Build process (concat and minify)

function capiraslangTask(slang) {
    return gulp.src(['src/' + slang + '/**/*.js', '!src/' + slang + '/demo'])
        .pipe(concat('' + slang + '.js'))
        .pipe(gulp.dest('dist/' + slang + '/'))
        .pipe(uglify())
        .pipe(rename('' + slang + '.min.js'))
        .pipe(gulp.dest('dist/' + slang + '/'));
}

gulp.task('mathslang', function() {
    return capiraslangTask('mathslang');
});

gulp.task('colors', function() {
    return capiraslangTask('colors');
});

gulp.task('hausdorff-metric', function() {
    return capiraslangTask('hausdorff-metric');
});

gulp.task('langslang', function() {
    return capiraslangTask('langslang');
});

gulp.task('logicslang', function() {
    return capiraslangTask('logicslang');
});

gulp.task('capiraslang', function() {
    return gulp.src(['dist/**/*.js','!capiraslang'])
        .pipe(concat('capiraslang.js'))
        .pipe(gulp.dest('dist/capiraslang/'))
        .pipe(uglify())
        .pipe(rename('capiraslang.min.js'))
        .pipe(gulp.dest('dist/capiraslang/'));
});



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
