// Copyright (c) Salesforce.com, Inc.
// Licensed under BSD 3-Clause – see LICENSE.txt

'use strict';

const path = require('path');
const fs = require('fs');
const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync').create();
const JSON5 = require('json5');
const nunjucksRender = require('gulp-nunjucks-render');

const $ = require('gulp-load-plugins')({
  postRequireTransforms: {
    sass: (sass) => sass(require('sass'))
  }
});

/* ---------------------------------- Paths --------------------------------- */

const SRC = 'src';
const DIST = 'dist';

const paths = {
  assets: [
    'node_modules/@salesforce-ux/design-system/assets/**/*.{woff,woff2,txt,jpg,png,gif,svg}',
    `${SRC}/assets/**/*.{woff,woff2,txt,jpg,png,gif,svg}`
  ],
  views: {
    pages: [`${SRC}/views/**/*.html`, `!${SRC}/views/**/_*.html`],
    data: `${SRC}/views/data/*.json`,
    base: `${SRC}/views`
  },
  scripts: `${SRC}/scripts/**/*.js`,
  styles: `${SRC}/styles/**/*.scss`
};

/* ------------------------------ Data for views ----------------------------- */

const getSharedData = () =>
  JSON5.parse(fs.readFileSync(path.join(SRC, 'views/data/shared.json'), 'utf8'));

const getData = (file) => {
  const dataPath = path.resolve(
    SRC,
    'views/data',
    `${path.basename(file.path, '.html')}.json`
  );
  let data = { shared: getSharedData() };
  try {
    data = Object.assign(data, JSON5.parse(fs.readFileSync(dataPath, 'utf8')));
  } catch (_e) {
    // ignore missing/invalid JSON
  }
  return data;
};

/* ---------------------------------- Tasks --------------------------------- */

function clean() {
  return del([DIST], { dot: true });
}

function assets() {
  return gulp.src(paths.assets).pipe(gulp.dest(`${DIST}/assets`));
}

function favicon() {
  return gulp.src([`${SRC}/favicon*.*`], { base: SRC }).pipe(gulp.dest(DIST));
}

function views() {
  return gulp.src(['src/views/**/*.html', '!src/views/**/_*.html'], { base: 'src/views' })
    .pipe($.plumber())
    .pipe($.data(getData))
    .pipe(nunjucksRender({ path: ['src/views'], envOptions: { noCache: true } }))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream()); // 👈 optional but nice for instant reload
}

function scripts() {
  return gulp.src(paths.scripts, { base: SRC }).pipe(gulp.dest(DIST));
}

function styles() {
  return gulp
    .src(paths.styles)
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass
        .sync({ precision: 10 })
        .on('error', $.sass.logError)
    )
    // autoprefixer: modern option name
    .pipe($.autoprefixer({ overrideBrowserslist: ['last 2 versions'], remove: false }))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(`${DIST}/styles`))
    .pipe(browserSync.stream({ match: '**/*.css' }));
}

/* ------------------------------- Dev server -------------------------------- */
function serve() {
  browserSync.init({
    notify: false,
    open: false,
    server: { baseDir: 'dist' },
    startPath: 'pages/request_type.html'
  });

  gulp.watch('src/styles/**/*.scss', styles);

  // 👇 include ALL view files in the watcher (including _partials & _base)
  gulp.watch(
    ['src/views/**/*.html', 'src/views/data/*.json'],
    views
  );

  gulp.watch(['src/assets/**/*.{woff,woff2,txt,jpg,png,gif,svg}'], assets);
  gulp.watch('src/scripts/**/*.js', scripts);

  gulp.watch([
    'dist/**/*.html',
    'dist/scripts/**/*.js',
    'dist/assets/*.{woff,woff2,txt,jpg,png,gif,svg}',
    'dist/assets/styles/*.css'
  ]).on('change', browserSync.reload);
}

/* --------------------------------- Exports -------------------------------- */

const build = gulp.series(clean, gulp.parallel(assets, views, styles, scripts, favicon));
const dev = gulp.series(build, serve);

exports.clean = clean;
exports.assets = assets;
exports.views = views;
exports.styles = styles;
exports.scripts = scripts;
exports.favicon = favicon;
exports.build = build;
exports.default = dev;
