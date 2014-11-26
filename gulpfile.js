var gulp = require('gulp');
var replace = require('gulp-replace');
var imagemin = require('gulp-imagemin');
var jpegtran = require('imagemin-jpegtran');
var jpegoptim = require('imagemin-jpegoptim');
var remoteSrc = require('gulp-remote-src');
var rename = require('gulp-rename');
var fs = require('fs');


//Minification without quality loss ~90% original size
gulp.task('imagemin', function() {
  return gulp.src('images/**/*.jpg')
    .pipe(imagemin({
      progressive: true, 
      use: [jpegtran()]
    }))
    .pipe(gulp.dest('public/images'));
})

//Quality Loss ~50% original size 
gulp.task('jpegoptim', function() {
  return gulp.src('images/**/*.jpg')
    .pipe(imagemin({
      progressive: true, 
      use: [jpegoptim({
        max: 50
      })]
    }))
    .pipe(gulp.dest('public/images'));
})


//Replaces s3 references with local paths
gulp.task('replace', function() {
  return gulp.src('public/index.html')
    .pipe(replace(/https:\/\/s3.amazonaws.com\/Bloomy-Slidey\/*/g, 'images/'))
    .pipe(gulp.dest('public/'));
})

//Searches public/index.html for s3 image src references downloads them to images/
gulp.task('remote', function() {
  fs.readFile('public/index.html', 'utf-8', function(err, data) {
    var imageArray = data.match(/h\S*(.jpg)/g);
    console.log(imageArray);

    remoteSrc(imageArray, {
      base: '',
    })
    .pipe(rename(function(path) {
      var folders = path.dirname.split('/').reverse()
      path.dirname = folders[1] + '/' + folders[0]
    }))
    .pipe(gulp.dest('./images/'));
  })
})

//Runs remote and minifies images with imagemin
gulp.task('images', function() {
  fs.readFile('public/index.html', 'utf-8', function(err, data) {
    var imageArray = data.match(/h\S*(.jpg)/g);
    console.log(imageArray);

    remoteSrc(imageArray, {
      base: '',
    })
    .pipe(rename(function(path) {
      var folders = path.dirname.split('/').reverse()
      path.dirname = folders[1] + '/' + folders[0]
    }))
    .pipe(imagemin({
      progressive: true, 
      use: [jpegoptim({
        max: 50
      })]
    }))
    .pipe(gulp.dest('public/images'));
  })
})


gulp.task('default', ['images', 'replace'])