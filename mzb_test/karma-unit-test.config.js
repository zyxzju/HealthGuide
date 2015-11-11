// Karma configuration
// Generated on Mon Nov 09 2015 16:26:28 GMT+0800 (中国标准时间)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '../',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
        "www/lib/ionic/js/ionic.bundle.js",
        "www/lib/ngCordova/dist/ng-cordova.min.js",
        "www/lib/angular-resource/angular-resource.min.js",
        "www/lib/ionic-datepicker-master/dist/ionic-datepicker.bundle.min.js",
        "www/lib/angular-mocks/angular-mocks.js",

        "www/lib/qrcode-generator/js/qrcode.js",
        "www/lib/qrcode-generator/js/qrcode_UTF8.js",
        "www/lib/angular-qrcode/angular-qrcode.js",
        "www/lib/jquery/qrcode.min.js",
        "www/lib/angular-qr-master/angular-qr.min.js",

        "www/lib/angular-socket-io/socket.min.js",
        "www/lib/socket.io.js",

        "www/lib/amcharts.js",
        "www/lib/serial.js",
        "www/lib/amstock.js",

   
        "www/js/app.js",
        "www/js/services.js",
        "www/js/directives.js",
        "www/js/filters.js",
        "www/js/controller.js",

        "www/lib/ionic-timepicker/dist/ionic-timepicker.bundle.min.js",


        'mzb_test/unit-tests/controllertest.js'
    ],


    // list of files to exclude
    exclude: [
       
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false
  })
}
