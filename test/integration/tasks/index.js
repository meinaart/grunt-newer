var assert = require('assert');
var fs = require('fs');


/**
 * Create a clone of the object with just src and dest properties.
 * @param {Object} obj Source object.
 * @return {Object} Pruned clone.
 */
function prune(obj) {
  return {
    src: obj.src,
    dest: obj.dest
  };
}


/**
 * Remove files config objects with no src files.
 * @param {Array} files Array of files config objects.
 * @param {string} fallbackDest Optional fallback dest when no dest is supplied
 * @return {Array} Filtered array of files config objects.
 */
function filter(files, fallbackDest) {
  function fallbackPrune(obj) {
    return {
      src: obj.src,
      dest: fallbackDest
    };
  }

  return files.map(fallbackDest !== undefined ? fallbackPrune : prune).filter(function(obj) {
    return obj.src && obj.src.length > 0 && obj.dest !== false;
  });
}


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.registerMultiTask('assert', function(name, target) {
    var config = grunt.config([name, target]);
    var expected = filter(grunt.task.normalizeMultiTaskFiles(config, target));
    var log = this.data.getLog();

    if (expected.length === 0) {
      console.log(log[0]);
      assert.equal(log.length, 0, 'Expected no log entries, got ' + log.length);
      log.length = 0;
    } else {
      assert.equal(log.length, 1, 'Expected one log entry, got ' + log.length);
      var actual = log[0];
      assert.deepEqual(actual, expected);
      log.length = 0;
    }
  });


  grunt.registerMultiTask('log', function() {
    var files = filter(this.files, this.data.customDest);
    if (files.length > 0) {
      this.data.getLog().push(files);
    }

    // create all dest files
    files.forEach(function(obj) {
      if (obj.dest) {
        grunt.file.write(obj.dest, '');
      }
    });
  });

  grunt.registerTask('wait', function(delay) {
    setTimeout(this.async(), delay);
  });


  grunt.registerMultiTask('modified', function() {
    this.filesSrc.forEach(function(filepath) {
      var now = new Date();
      fs.utimesSync(filepath, now, now);
      grunt.verbose.writeln('Updating mtime for file: ' + filepath, now);
    });
  });

};
