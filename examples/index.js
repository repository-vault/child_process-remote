"use strict";

const net = require('net');
const Server = require('../server');
const Spawn  = require('../spawn');

if(process.argv[2] == "server") {
  
  var server = net.createServer(Server);

  server.listen(8080, function() {
    console.log("Server is now ready");
  });
}

if(process.argv[2] == "client") {
  var client = net.connect(8080);

  var spawn = Spawn(client);

  var version = '';
  var child = spawn('node', ['-v']);
  child.stdout.on('data', function(line) {
    version = line;
  })

  child.on('exit', function(exit) {
    console.log("Got pid", child.pid);
    console.log('All done, version is %s , exit code is %d', version, exit);

    var result = '';
    var child2 = spawn('node', ['-p', '40+2']);
    child2.stdout.on('data', function(line) {
      result = line;
    })

    child2.on('exit', function(exit) {
      console.log("Got pid", child2.pid);
      console.log('All done, response is %s , exit code is %d', result, exit);

      client.destroy();
    });


  });









}

