"use strict";

const Server = require('../server');
const Spawn  = require('../spawn');

if(process.argv[2] == "server") {
  var server = new Server();

  server.listen(8080, function() {
    console.log("Server is now ready");
  });
}

if(process.argv[2] == "client") {
  var spawn = Spawn(8080, '127.0.0.1');

  var version = '';
  var child = spawn('node', ['-v']);
  child.stdout.on('data', function(line) {
    version = line;
  })

  child.on('exit', function(exit) {
    console.log("Got pid", child.pid);
    console.log('All done, version is %s , exit code is %d', version, exit);
  });

}

