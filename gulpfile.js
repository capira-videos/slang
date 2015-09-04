var gulp = require('gulp');

var paths = {
    src: 'src/**/*.js',
    spec: 'spec/**/*-spec.js',
    build: 'dist/slang.min.js'
}

/*
 * 
 * Build process (concat and minify)
 *
 */
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

function slangTask(slang) {
    return gulp.src(['src/' + slang + '/**/*.js'])
        .pipe(concat('' + slang + '.js'))
        .pipe(gulp.dest('dist/' + slang + '/'))
        .pipe(uglify())
        .pipe(rename('' + slang + '.min.js'))
        .pipe(gulp.dest('dist/' + slang + '/'));
}

gulp.task('mathslang', function() {
    return slangTask('mathslang');
});

gulp.task('colorslang', function() {
    return slangTask('colorslang');
});

gulp.task('hausdorffslang', function() {
    return slangTask('hausdorffslang');
});

gulp.task('langslang', function() {
    return slangTask('langslang');
});

gulp.task('logicslang', function() {
    return slangTask('logicslang');
});

gulp.task('build', ['mathslang', 'colorslang', 'hausdorffslang', 'langslang', 'logicslang'], function() {
    return gulp.src(['dist/**/*.js','!dist/**/*min.js', '!dist/slang.js', '!dist/slang.min.js'])
        .pipe(concat('slang.js'))
        .pipe(uglify({
            compress: {
                drop_console: true,
                booleans: true,
                sequences: true,
                dead_code: true,
                loops:true
            }
        }))
        .pipe(rename('slang.min.js'))
        .pipe(gulp.dest('dist/'));
});




/*
 * 
 * Test
 *
 */
var jasmine = new require('gulp-jasmine-livereload-task');


gulp.task('default', function() {
    gulp.run(jasmine({
        files: [paths.src, paths.spec]
    }));
});

gulp.task('watch', function() {
    gulp.watch(paths.src, ['build']);
});

gulp.task('test-build', ['watch'], function() {
    gulp.run(jasmine({
        files: [paths.build, paths.spec]
    }));
});
