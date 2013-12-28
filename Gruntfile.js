module.exports = function (grunt) {
  'use strict';

  grunt.initConfig({
    eslint: {
      options: {
        config: 'config/eslint.json'
      },
      target: [
        'bin/*',
        'processors/**/*.js',
        'simulation/**/*.js',
        '*.js'
      ]
    },
    simplemocha: {
      options: {
        slow: 60,
        growl: true,
        ui: 'bdd',
        debug: true,
        recursive: true,
        reporter: 'spec',
        timeout: 10000,
        require: ['test/config']
      },

      all: { src: 'test/**/*.js' }
    },
    watch: {
      source: {
        options: {
          atBegin: true,
          livereload: true
        },
        files: '<%= eslint.target %>',
        tasks: 'eslint'
      }
    }
  });

  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('test', ['eslint', 'simplemocha']);
  grunt.registerTask('default', ['watch']);
};

