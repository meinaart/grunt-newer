var path = require('path');
var assert = require('assert');

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var log = [];
  var callbackTask = false;
  var callbackFunction = false;
  var callbackCustomTask = false;

  grunt.registerTask('newer-callback:log:all', function() {
    callbackTask = true;
  });

  grunt.registerTask('newer-callback:log:one', function() {});

  grunt.registerTask('newer-callback-custom', function() {
    callbackCustomTask = true;
  });

  grunt.initConfig({
    newer: {
      options: {
        cache: path.join(__dirname, '.cache'),
        callback: true
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
        },
        newer: {
          callback: function(taskName, success) {
            callbackFunction = success;
          }
        }
      },
      one: {
        src: 'src/one.js',
        getLog: function() {
          return log;
        },
        newer: {
          callback: 'newer-callback-custom'
        }
      }
    },
  });

  grunt.registerTask('assert-callback-task', function() {
    assert(callbackTask, 'Test if callback task has been performed');
  });

  grunt.registerTask('assert-callback-task-custom', function() {
    assert(callbackCustomTask,
      'Test if callback task with custom name has been performed');
  });

  grunt.registerTask('assert-callback-task-custom-false', function() {
    assert(!!callbackCustomTask,
      'Test if callback task with custom name has not been performed');
  });

  grunt.registerTask('assert-callback-function', function() {
    assert(callbackFunction, 'Test if callback function has been called');
  });

  grunt.registerTask('assert-callback-function-false', function() {
    assert(!!callbackFunction,
      'Test if callback function has retrieved correct status');
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
      
      // Something has changed so callbackFunction and 
      // callbackTask should now be true
      'assert-callback-function',
      'assert-callback-task',
      
      // Do nothing
      'newer:log:all',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // Nothing changed so callbackFunction should now be false
      // callbackTask should still be true as this value was set to true
      // previously
      'assert-callback-function-false',
      'assert-callback-task',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // Callback with custom name should not have been called
      // as this is linked to newer:log:one
      'assert-callback-task-custom-false',

      // Modify one file and see if custom callback is called
      'modified:one',
      'newer:log:one',
      'assert-callback-task-custom'
    ]);
  });
};
