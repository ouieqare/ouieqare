"use strict";

const sass = require("gulp-sass")(require("sass"));
const gulp = require("gulp");
const gutil = require("gulp-util");
const sourcemaps = require("gulp-sourcemaps");
const fileinclude = require("gulp-file-include");
const autoprefixer = require("gulp-autoprefixer");
const bs = require("browser-sync").create();
const rimraf = require("rimraf");
const comments = require("gulp-header-comment");
const jshint = require("gulp-jshint");
const sitemap = require('gulp-sitemap');
const nodemon = require('gulp-nodemon');

// Importation dynamique de del
// async function clean() {
//   const del = await import('del');
//   return del.default(['theme/**', '!theme/server.js']); // Assurez-vous d'utiliser del.default
// }

// gulp.task('clean', clean);

var paths = {
  src: {
    html: "source/*.html",
    others: "source/*.+(php|ico|png)",
    htminc: "source/partials/**/*.htm",
    incdir: "source/partials/",
    plugins: "source/plugins/**/*.*",
    js: "source/js/*.js",
    scss: "source/scss/**/*.scss",
    images: "source/images/**/*.+(png|jpg|gif|svg)",
    fonts: "source/fonts/**/*.+(eot|ttf|woff|woff2|otf)",
  },
  build: {
    dir: "theme/",
  },
};

gulp.task("copy-ads-txt", function () {
  return gulp.src("source/ads.txt")
    .pipe(gulp.dest("theme/"));
});

gulp.task("copy-robots-txt", function () {
  return gulp.src("robots.txt")  // Assurez-vous que le chemin d'accès est correct
    .pipe(gulp.dest("theme/"));  // Modifier le répertoire de destination si nécessaire
});



// HTML
gulp.task("html:build", function () {
  return gulp
    .src(paths.src.html)
    .pipe(
      fileinclude({
        basepath: paths.src.incdir,
      })
    )
    .pipe(
      comments(`
    WEBSITE: https://themefisher.com
    TWITTER: https://twitter.com/themefisher
    FACEBOOK: https://www.facebook.com/themefisher
    GITHUB: https://github.com/themefisher/
    `)
    )
    .pipe(gulp.dest(paths.build.dir))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

gulp.task('start', function () {
  nodemon({
    script: 'server.js',
    ext: 'js html',
    env: { 'NODE_ENV': 'development' }
  })
});

// SCSS
gulp.task("scss:build", function () {
  return gulp
    .src(paths.src.scss)
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", sass.logError)
    )
    .pipe(autoprefixer())
    .pipe(sourcemaps.write("/"))
    .pipe(
      comments(`
    WEBSITE: https://themefisher.com
    TWITTER: https://twitter.com/themefisher
    FACEBOOK: https://www.facebook.com/themefisher
    GITHUB: https://github.com/themefisher/
    `)
    )
    .pipe(gulp.dest(paths.build.dir + "css/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// Javascript
gulp.task("js:build", function () {
  return gulp
    .src(paths.src.js)
    .pipe(jshint("./.jshintrc"))
    .pipe(jshint.reporter("jshint-stylish"))
    .on("error", gutil.log)
    .pipe(
      comments(`
  WEBSITE: https://themefisher.com
  TWITTER: https://twitter.com/themefisher
  FACEBOOK: https://www.facebook.com/themefisher
  GITHUB: https://github.com/themefisher/
  `)
    )
    .pipe(gulp.dest(paths.build.dir + "js/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// Images
gulp.task("images:build", function () {
  return gulp
    .src(paths.src.images)
    .pipe(gulp.dest(paths.build.dir + "images/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});


// fonts
gulp.task("fonts:build", function () {
  return gulp
    .src(paths.src.fonts)
    .pipe(gulp.dest(paths.build.dir + "fonts/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

// Plugins
gulp.task("plugins:build", function () {
  return gulp
    .src(paths.src.plugins)
    .pipe(gulp.dest(paths.build.dir + "plugins/"))
    .pipe(
      bs.reload({
        stream: true,
      })
    );
});

gulp.task('clean', () => rimraf(paths.build.dir, () => true));

// Sitemap Task
// gulp.task('generate-sitemap', function () {
//   return gulp.src(path.src.html)
//     .pipe(sitemap({
//         siteUrl: 'https://www.ouieqare.com'
//     }))
//     .pipe(gulp.dest(path.build.dir));
// });

// gulp.task('generate-sitemap', () => 
//   gulp.src(`${paths.src.html}`)
//     .pipe(sitemap({siteUrl: 'https://www.ouieqare.com'}))
//     .pipe(gulp.dest('./')) // Générer à la racine
// );

// Copie du sitemap vers le répertoire de thème
gulp.task('copy-sitemap', () => gulp.src('sitemap.xml').pipe(gulp.dest(paths.build.dir)));



// Other files like favicon, php, sourcele-icon on root directory
gulp.task("others:build", function () {
  return gulp.src(paths.src.others).pipe(gulp.dest(paths.build.dir));
});

// Clean Build Folder
gulp.task("clean", function (cb) {
  rimraf("./theme", cb);
});

// Watch Task
gulp.task("watch:build", function () {
  gulp.watch(paths.src.html, gulp.series("html:build"));
  gulp.watch(paths.src.htminc, gulp.series("html:build"));
  gulp.watch(paths.src.scss, gulp.series("scss:build"));
  gulp.watch(paths.src.js, gulp.series("js:build"));
  gulp.watch(paths.src.images, gulp.series("images:build"));
  gulp.watch(paths.src.fonts, gulp.series("fonts:build"));
  gulp.watch(paths.src.plugins, gulp.series("plugins:build"));
});

// Dev Task
gulp.task(
  "default",
  gulp.series(
    "clean",
    "html:build",
    "js:build",
    "scss:build",
    "images:build",
    "fonts:build",
    "plugins:build",
    "others:build",
    "copy-sitemap",
    "copy-ads-txt",
    "copy-robots-txt",
    "start",
    gulp.parallel("watch:build", function () {
      bs.init({
        server: {
          baseDir: paths.build.dir,
        },
      });
    })
  )
);

// Build Task
gulp.task(
  "build",
  gulp.series(
    "html:build",
    "js:build",
    "scss:build",
    "images:build",
    "fonts:build",
    "plugins:build",
    "copy-sitemap"
  )
);