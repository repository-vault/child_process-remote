"use strict";

const http = require('http');
const url = require('url');

const Server = require('../server');
const Spawn  = require('../spawn');


if(process.argv[2] == "server") {
  var query = Object.assign(url.parse("http://127.0.0.1:8080/"), {method : 'POST'});

  var req = http.request(query,   function(res) {

    console.log("New http client");
    //res.flushHeaders();
    Server(req, res);
    res.on("end", process.exit);

  });

  req.flushHeaders();
  //req.write("hi");

  //req.end();

}

if(process.argv[2] == "client") {
  
  var server = http.createServer(function(req, res) {

    console.log("New http client");
    res.flushHeaders();
        
    var spawn = Spawn(res, req);

    var version = '';
    var child = spawn('node', ['-v']);
    child.stdout.on('data', function(line) {
      version = line;
    })

    child.on('exit', function(exit) {
      console.log("Got pid", child.pid);
      console.log('All done, version is %s , exit code is %d', version, exit);
      res.end("all good");
    });

  });

  server.listen(8080, function() {
    console.log("Client is now ready");
  });
}
