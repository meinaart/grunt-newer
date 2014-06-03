var path = require('path');


/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {

  var log = [];

  grunt.initConfig({
    newer: {
      options: {
        cache: path.join(__dirname, '.cache')
      }
    },
    clean: {
      dest: path.join(__dirname, 'dest')
    },
    modified: {
      dest: {
        src: 'src/one.js',
        dest: 'dest/one.js'
      },
      src: {
        src: 'src/one.js',
        dest: 'src/one.js'
      },
      none: {
        src: []
      }
    },
    log: {
      dest: {
        src: 'src/one.js',
        customDest: 'dest/one.js',
        newer: ['dest/one.js'],
        getLog: function() {
          return log;
        }
      },
      dest_src: {
        src: 'src/one.js',
        customDest: 'src/one.js',
        newer: {
          keys: ['customDest']
        },
        getLog: function() {
          return log;
        }
      },
      dest_fail: {
        src: 'src/one.js',
        customDest: 'dest/one.js',
        getLog: function() {
          return log;
        }
      }
    },
    assert: {
      that: {
        getLog: function() {
          return log;
        }
      }
    },
  });

  grunt.loadTasks('../../../node_modules/grunt-contrib-clean/tasks');

  grunt.loadTasks('../../../tasks');
  grunt.loadTasks('../../../test/integration/tasks');

  grunt.registerTask('default', function() {
    grunt.task.run([
      // run assert task again, expect one file
      'newer:log:dest',
      'assert:that:modified:dest',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // modify one file
      'modified:src',

      // run assert task again, expect one file
      'newer:log:dest',
      'assert:that:modified:dest',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // modify nothing, expect no files
      'newer:log:dest',
      'assert:that:modified:none',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // should change file in dest because newer option is missing
      'newer:log:dest_fail',
      'assert:that:modified:dest',

      // HFS+ filesystem mtime resolution
      'wait:1001',

      // modify one file
      'modified:dest',

      // Change source file via custom dest,
      // expect changed file in src
      'newer:log:dest_src',
      'assert:that:modified:src',
    ]);
  });

};
