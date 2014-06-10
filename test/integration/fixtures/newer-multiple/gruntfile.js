var path = require('path');
var assert = require('assert');

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var log = [];
  var secondTask = false;

  grunt.registerTask('newer-second-task', function() {
    secondTask = true;
  });

  grunt.registerTask('newer-second-task-toggle', function() {
    secondTask = !secondTask;
  });

  grunt.initConfig({
    newer: {
      options: {
        cache: path.join(__dirname, '.cache')
      }
    },
    modified: {
      one: {
        src: 'src/one.js'
      },
      all: {
        src: 'src/**/*.js'
      },
      none: {
        src: []
      }
    },
    log: {
      all: {
        src: 'src/**/*.js',
        getLog: function() {
          return log;
        }
      },
      one: {
        src: 'src/one.js',
        getLog: function() {
          return log;
        }
      }
    },
  });

  grunt.registerTask('assert-second-task', function() {
    assert(secondTask === true, 'Test if second task has been performed');
  });

  grunt.registerTask('assert-second-task-false', function() {
    assert(secondTask === false, 'Test if second task has not been called');
  });

  var baseDir = '../../..';
  grunt.loadTasks(baseDir + '/tasks');
  grunt.loadTasks(baseDir + '/test/integration/tasks');

  grunt.registerTask('default', function() {
    grunt.task.run([
      'newer:log',
      // HFS+ filesystem mtime resolution
      'wait:1001',

      // Modify one file
      'modified:one',
      'newer:log:all',
      
      'assert-second-task-false',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      'modified:one',
      'newer:log:all,newer-second-task',

      'assert-second-task',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      'modified:one',
      'newer:log:all,newer-second-task,' +
        'newer-second-task-toggle,newer-second-task-toggle',

      'assert-second-task'
    ]);
  });
};
