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

  this.timeout(10 * 1000);

  it("should ask for a simple argv call", async () => {

    var spawn = Spawn(port);
    var child = spawn('node', ['-v'], {stdio : ['ignore', 'pipe', 'ignore']});

    var done = new Promise(resolve => child.once('exit', resolve));
    var body = new Promise(resolve => child.stdout.once('data', resolve));

    var version = String(await body).trim();
    var exit = await done;

    console.log("Got pid", child.pid);
    console.log('All done, version is %s , exit code is %d', version, exit);

    expect(exit).to.eql(0);
    expect(version).to.eql(process.version);
  });

  it("should test failure exit code", async () => {

    var spawn = Spawn(port);
    var child = spawn('node', ['-p', "process.exit(42)"]);

    var done = new Promise(resolve => child.once('exit', resolve));
    var exit = await done;

    console.log('All done, exit code is %d', exit);

    expect(exit).to.eql(42);
  });

  it("should test failure", async () => {

    var spawn = Spawn(port);
    var child = spawn('node', ['-p', "throw 'nope'"]);
    var stderr = '';
    var stdout = '';
    child.stderr.on('data', line => stderr += line);
    child.stdout.on('data', line => stdout += line);

    var done = new Promise(resolve => child.once('exit', resolve));
    var exit = await done;

    console.log('All done, exit code is %d', exit);

    expect(exit).to.eql(1);
    expect(stdout).to.eql("");
    expect(stderr).to.match(/nope/);
  });





});




