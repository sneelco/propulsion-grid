/* global module, require, process */

module.exports = function (grunt) {
  'use strict';

  var server,
    karma,
    jasmine;

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jslint: {
      client: {
        src: [
          'src/**/*.js'
        ],
        directives: {
          nomen: true,
          indent: 2,
          unparam: true,
          predef: [
            'define',
            'window',
            'console',
            'describe',
            'requirejs',
            'beforeEach',
            'afterEach',
            'inject',
            'expect',
            'Event',
            'it'
          ]
        },
        options: {
          errorsOnly: true, // only display errors
          failOnError: false // defaults to true
        }
      }
    },
    watch: {
      scripts: {
        files: [
          'src/**/*.js'
          ],
        tasks: ['jslint:client'],
        options: {
          nospawn: true
        }
      }
    },
    requirejs: {
      compile: {
        options: {
          mainConfigFile: 'src/main.js',
          baseUrl: 'src',
          name: 'main',
          out: 'main.min.js'
        }
      }
    },
    uglify : {
      debug_js: {
        options: {
          mangle: false,
          beautify: true
        },
        files: {
          'static/scripts/main.min.debug.js': ['static/scripts/main.min.js']
        }
      }
    },
    cssmin: {
      combine: {
        files: {
          'styles.min.css': [
            'src/styles/bootstrap.css',
            'src/styles/styles.css',
            'src/vendor/angular-grid/ng-grid.css'
          ]
        }
      }
    },
    env: {
      dev: {
        NODE_ENV: 'dev'
      },
      prod: {
        NODE_ENV: 'prod'
      }
    }
  });

  grunt.loadNpmTasks('grunt-jslint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-env');

  grunt.registerTask('start', function () {
    if (server) {
      server.kill();
    }
    server = grunt.util.spawn({
      cmd: 'node_modules/http-server/bin/http-server',
      args: ['-c-1','.']
    }, function () {
      console.log('Restarting server');
    });
    server.stdout.pipe(process.stdout);
    server.stderr.pipe(process.stderr);
    grunt.task.run('watch');
  });

  grunt.registerTask('default', ['env:dev', 'jslint:client', 'start']);
};
