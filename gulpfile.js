const { src, dest, series, paralell } = require('gulp');
const rollup = require('rollup');
const sass = require('gulp-sass')
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const template = require('gulp-template');
const del = require('del');
//const json = require('rollup-plugin-json');

function clean() {
  return del('dist/**/*');
}

async function bundle() {
  const bundle = await rollup.rollup({
    input: './src/lib/main.js',
  });

  await bundle.write({
    file: './dist/BooruLightbox.js',
    format: 'iife',
    name: 'BooruLightbox',
  });
};

function copy() {
  return src('./src/root/**/*', { base: './src/root/'})
    .pipe(dest('./dist/'));
}

function styles() {
  return src('./src/css/**/*.scss')
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([ autoprefixer() ]))
    .pipe(concat('style.css'))
    .pipe(dest('./dist/'));
};

function sites() {
  return src('./src/js/sites/*.js')
    .pipe(dest('./dist/'));
};

function assets() {
  return src('./src/img/**/*')
    .pipe(dest('./dist/img/'));
};

function manifest() {
  return src('./src/manifest.json')
    .pipe(template({ pkg: require('./package.json') }))
    .pipe(dest('./dist/'));
};

exports.build = series(clean, bundle, copy, styles, assets, manifest);