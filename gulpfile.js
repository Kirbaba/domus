var gulp = require('gulp'), // Подключаем Gulp
    sass = require('gulp-sass'), //Подключаем Sass пакет,
    browserSync = require('browser-sync'), // Подключаем Browser Sync
    concat = require('gulp-concat'), // Подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // Подключаем gulp-uglifyjs (для сжатия JS)
    rename = require('gulp-rename'), // Подключаем библиотеку для переименования файлов
    del = require('del'), // Подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // Подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // Подключаем библиотеку для работы с png
    cache = require('gulp-cache'); // Подключаем библиотеку кеширования
    //autoprefixer = require('gulp-autoprefixer'); // Подключаем библиотеку для автоматического добавления префиксов

    var postcss = require('gulp-postcss');

    var autoprefixer = require('autoprefixer');
    var cssnano = require('cssnano');
    var pxtorem = require('postcss-pxtorem');
    var short = require('postcss-short');
    var stylefmt = require('stylefmt');
    var assets  = require('postcss-assets');
    var shortspacing = require('postcss-short-spacing')
    // var stylelint = require('stylelint');
    // var reporter = require('postcss-reporter');

gulp.task('css-libs', function() { // Создаем таск Sass
    var processors = [
        cssnano
    ]
    return gulp.src([
            'app/libs/normalize-css/normalize.css',
            'app/libs/owl/owl-carousel/owl.carousel.css',
            'app/libs/owl/owl-carousel/owl.theme.css',
            'app/libs/owl/owl-carousel/owl.transitions.css',
        ]) // Берем источник
        .pipe(postcss(processors))
        .pipe(concat('libs.min.css'))
        .pipe(gulp.dest('css')) // Выгружаем результата в папку app/css
        .pipe(browserSync.reload({
            stream: true
        })) // Обновляем CSS на странице при изменении
});

gulp.task('js-libs', function() {
    return gulp.src([ // Берем все необходимые библиотеки
            'app/libs/jquery/dist/jquery.min.js'
        ])
        .pipe(concat('libs.min.js')) // Собираем их в кучу в новом файле libs.min.js
        .pipe(uglify()) // Сжимаем JS файл
        .pipe(gulp.dest('js')); // Выгружаем в папку app/js
});

gulp.task('sass', function() { // Создаем таск Sass
    var processors = [
        assets,
        short,
        autoprefixer(['last 5 versions', '> 5%', 'ie 8', 'ie 7'], {
            cascade: true
        }),
        pxtorem({
            rootValue: 14,
            replace: false
        }),
        stylefmt,
        cssnano
    ];
    return gulp.src('app/sass/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(processors))
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(gulp.dest('css'))
        .pipe(browserSync.reload({
            stream: true
        }));
});

gulp.task('browser-sync', function() { // Создаем таск browser-sync
    browserSync({ // Выполняем browserSync
        proxy: {
            target: 'domus' // Директория для сервера - app
        },
        ghostMode: {
            clicks: true,
            forms: true,
            scroll: true
        },
        notify: false // Отключаем уведомления
    });
});

gulp.task('img', function() {
    return gulp.src('app/img/**/*') // Берем все изображения из app
        .pipe(cache(imagemin({ // Сжимаем их с наилучшими настройками с учетом кеширования
            interlaced: true,
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            use: [pngquant()]
        })))
        .pipe(gulp.dest('img'))
        .pipe(browserSync.reload({
            stream: true
        }));
});


gulp.task('compress', function() {
  return gulp.src('app/js/*.js')    
    .pipe(concat('script.js'))
    .pipe(gulp.dest('js'));
    
});

gulp.task('extend', function () {
    gulp.src('./app/html/*.html')
        .pipe(extender({annotations:true,verbose:false})) // default options
        .pipe(gulp.dest('./'))

});

gulp.task('watch', ['browser-sync', 'compress'], function() {
    gulp.watch('app/img/**/*', ['img']);
    gulp.watch('app/sass/**/*.scss', ['sass']); // Наблюдение за sass файлами в папке sass
    gulp.watch(['./app/html/*.html'], ['extend']);
    gulp.watch('./**/*.html', browserSync.reload); // Наблюдение за HTML файлами в корне проекта
    gulp.watch('app/js/*', function() {
       gulp.run('compress');
  }, browserSync.reload); // Наблюдение за JS файлами в папке js
});

gulp.task('build', ['img', 'sass', 'scripts'], function() {

    var buildCss = gulp.src([ // Переносим библиотеки в продакшен
            'app/css/main.css',
            'app/css/libs.min.css'
        ])
        .pipe(gulp.dest('css'))

    var buildFonts = gulp.src('app/fonts/**/*') // Переносим шрифты в продакшен
        .pipe(gulp.dest('fonts'))

    var buildJs = gulp.src('app/js/**/*') // Переносим скрипты в продакшен
        .pipe(gulp.dest('js'))

});


gulp.task('clear', function(callback) {
    return cache.clearAll();
});
gulp.task('default', ['watch']);


