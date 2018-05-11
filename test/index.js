"use strict";

/* eslint-env node,mocha */

const expect = require('expect.js');

const Server = require('../server');
const Spawn  = require('../spawn');


describe("Simple distribution", function() {
  var port = 8080;
  it("should start a server", function(done) {
    var server = new Server();
    server.listen(port, function() {
      console.log("Server is now ready");
      done();
    });
  });

  it("should ask for a simple argv call", async () => {

    var spawn = Spawn(port);
    var child = spawn('node', ['-v']);

    var version = await new Promise(resolve => child.stdout.once('data', resolve));
    version = String(version).trim();

    var exit = await new Promise(resolve => child.once('exit', resolve));

    console.log("Got pid", child.pid);
    console.log('All done, version is %s , exit code is %d', version, exit);

    expect(exit).to.eql(0);
    expect(version).to.eql(process.version);
  });

});




