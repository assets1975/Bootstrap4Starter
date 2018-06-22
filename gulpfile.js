const gulp = require('gulp');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const prefixer = require('gulp-autoprefixer');
const cssmin = require('gulp-minify-css');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
// const cleanCSS = require('gulp-clean-css');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const rimraf = require('rimraf');
const eslint = require('gulp-eslint');
// const restart = require('gulp-restart');

// const scsslint = require('gulp-scss-lint');
const reload = browserSync.reload;


// Compile Sass & Inject Into Browser
gulp.task('scss:build', function() {
    return gulp.src([
        'node_modules/bootstrap/scss/bootstrap.scss',
        'src/scss/*.scss'
    ]) // Выбираем наши scss фаилы
    //  return gulp.src([ 'src/scss/*.scss']) // Выбираем наши scss фаилы
        .pipe(plumber({
            errorHandler: function(err) {
              console.log(err);
              this.emit('end');
            }
          }))
        // .pipe(scsslint({
        //    'config': 'lint.yml'
        // }))
        // .pipe(scsslint.failReporter())
        .pipe(sourcemaps.init()) // То же самое что и с js
        .pipe(sass()) //    Скомпилируем
        .pipe(prefixer()) //    Добавим вендорные префиксы
        .pipe(cssmin()) //  Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
         .pipe(browserSync.stream());
        // .pipe(reload({stream: true}));
});

gulp.task('sass:build', function() {
    return gulp.src(['src/sass/*.sass']) // Выбираем наши scss фаилы
        .pipe(plumber({
            errorHandler: function(err) {
            console.log(err);
            this.emit('end');
            }
        }))
        .pipe(sourcemaps.init()) // То же самое что и с js
        .pipe(sass()) // Скомпилируем
        .pipe(prefixer()) // Добавим вендорные префиксы
        .pipe(cssmin()) // Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
        .pipe(reload({stream: true}));
});

// Move JS Files to src/js
gulp.task('js:build', function() {
     return gulp.src([
        'node_modules/bootstrap/dist/js/bootstrap.min.js',
        'node_modules/jquery/dist/jquery.min.js',
        'node_modules/popper.js/dist/umd/popper.min.js',
        'src/js/*.js'
    ])
        .pipe(plumber({
            errorHandler: function(err) {
            console.log(err);
            this.emit('end');
            }
        }))
        .pipe(sourcemaps.init()) // Инициализируем sourcemap
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .pipe(uglify()) // Сожмем наш js
        .pipe(sourcemaps.write()) // Пропишем карты
        .pipe(gulp.dest('dist/js'))
        // .pipe(browserSync.stream());
        .pipe(reload({stream: true}));
});

gulp.task('image:build', function() {
    return gulp.src(['src/img/**/*.*']) // Выберем наши картинки
        .pipe(plumber({
            errorHandler: function(err) {
            console.log(err);
            this.emit('end');
            }
        }))
        .pipe(imagemin({ // Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest('dist/img')) // И бросим в build
        // .pipe(browserSync.stream());
        .pipe(reload({stream: true}));
});

gulp.task('html:build', function() {
    return gulp.src('src/*.html')// Выберем файлы по нужному пути
        .pipe(plumber({
            errorHandler: function(err) {
            console.log(err);
            this.emit('end');
            }
        }))
        .pipe(gulp.dest('dist/'))// Выплюнем их в папку build
        .pipe(reload({stream: true}));// И перезагрузим наш сервер
});

// Move Fonts to src/fonts
gulp.task('fonts:build', function() {
    return gulp.src([
        'node_modules/font-awesome/fonts/*',
        'src/fonts/**/*.*'
    ])
    .pipe(plumber({
        errorHandler: function(err) {
          console.log(err);
          this.emit('end');
        }
      }))
    .pipe(gulp.dest('dist/fonts'))
    .pipe(reload({stream: true}));
})

// Move Font Awesome CSS to src/css
gulp.task('fa:build', function() {
  return gulp.src(['node_modules/font-awesome/css/font-awesome.min.css'])
    .pipe(plumber({
        errorHandler: function(err) {
        console.log(err);
        this.emit('end');
        }
    }))
    .pipe(gulp.dest('dist/css'))
    .pipe(reload({stream: true}));
})

gulp.task('build', [
    'sass:build',
    'html:build',
    'js:build',
    'scss:build',
    'fonts:build',
    'fa:build',
    'image:build'
]);

gulp.task('webserver', function() {
    browserSync({
        server: {
            baseDir: './dist'
        },
        tunnel: false,
        host: 'localhost',
        port: 8081,
        logPrefix: 'Asset Saparov'
    });
});

gulp.task('watch', function() {
    gulp.watch(['src/sass/*.sass'], function(event, cb) {
        gulp.start(['sass:build']);
    });
    gulp.watch(['src/scss/*.scss'], function(event, cb) {
        gulp.start(['scss:build']);
    });
    gulp.watch(['src/js/*.js'], function(event, cb) {
        gulp.start(['js:build']);
    });
    gulp.watch(['src/*.html'], function(event, cb) {
        gulp.start(['html:build']);
    });
    gulp.watch(['srct/img/*.*'], function(event, cb) {
        gulp.start(['image:build']);
    });
    gulp.watch(['src/fonts/*.*'], function(event, cb) {
        gulp.start(['fonts:build']);
    });
});

gulp.task('clean', function(cb) {
    rimraf('./dist', cb);
});

gulp.task('default', ['build', 'webserver', 'watch']);
