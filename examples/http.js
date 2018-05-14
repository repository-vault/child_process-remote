"use strict";

const http = require('http');
const url = require('url');

const Server = require('../server');
const Spawn  = require('../spawn');

if(process.argv[2] == "server") {
  
  var server = http.createServer(function(req, res) {
    console.log("New http client");
    res.flushHeaders();
    Server(res, req);
  });

  server.listen(8080, function() {
    console.log("Server is now ready");
  });
}

if(process.argv[2] == "client") {
  var query = url.parse("http://127.0.0.1:8080/");
  query.method = "POST";
  var req = http.request(query,   function(res) {

    
    var spawn = Spawn(req, res);

    var version = '';
    var child = spawn('node', ['-v']);
    child.stdout.on('data', function(line) {
      version = line;
    })

    child.on('exit', function(exit) {
      console.log("Got pid", child.pid);
      console.log('All done, version is %s , exit code is %d', version, exit);

    });


    setInterval(function() {

      var result = '';
      var child2 = spawn('node', ['-p', '40+2']);
      child2.stdout.on('data', function(line) {
        result = line;
      })

      child2.on('exit', function(exit) {
        console.log("Got pid", child2.pid);
        console.log('All done, version is %s , exit code is %d', result, exit);

      });
    }, 1000);


  });

  req.flushHeaders();


  //req.end();


}

