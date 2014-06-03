var path = require('path');

var helper = require('../helper');

var name = 'newer-option-newer';
var gruntfile = path.join(name, 'gruntfile.js');

describe(name, function() {
  var fixture;

  it('runs the option newer task (see ' + gruntfile + ')', function(done) {
    this.timeout(6000);
    helper.buildFixture(name, function(error, dir) {
      fixture = dir;
      done(error);
    });
  });

  after(function(done) {
    helper.afterFixture(fixture, done);
  });

});
