"use strict";

const http = require('http');
const url = require('url');

const Server = require('../server');
const Spawn  = require('../spawn');

if(process.argv[2] == "server") {

  var server = http.createServer(function(req, res) {
    res.flushHeaders();
  });

  server.on('upgrade', function(req, socket) {
    var query = ['HTTP/1.1 101', 'Upgrade: WebSocket', 'Connection: Upgrade', '', ''].join("\r\n");
    console.log("UPGRADING");
    socket.write(query);
    Server(socket);
  });


  server.listen(8080, function() {
    console.log("Server is now ready");
  });
}

if(process.argv[2] == "client") {

  var headers = {Connection : 'upgrade', Upgrade : 'websocket'};
  var query = {...url.parse("http://127.0.0.1:8080/"), method : 'POST', headers};

  var req = http.request(query,   function() {
    console.log("Connected client");
  });

  req.flushHeaders();

  req.on('upgrade', (res, socket) => {
    console.log('got upgraded!');
    var spawn = Spawn(socket);

    var version = '';
    var child = spawn('node', ['-v']);
    child.stdout.on('data', function(line) {
      version = line;
    });

    child.on('exit', function(exit) {
      console.log("Got pid", child.pid);
      console.log('All done, version is %s , exit code is %d', version, exit);
    });

    setInterval(function() {

      var result = '';
      var child2 = spawn('node', ['-p', '40+2']);
      child2.stdout.on('data', function(line) {
        result = line;
      });

      child2.on('exit', function(exit) {
        console.log("Got pid", child2.pid);
        console.log('All done, version is %s , exit code is %d', result, exit);
      });

    }, 1000);
  });


  //req.end();


}

