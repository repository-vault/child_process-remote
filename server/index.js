"use strict";

const net = require('net');
const spawn = require('child_process').spawn;

const multiplex = require('multiplex');


class Server {

  constructor() {
    this.server = net.createServer(this.incoming);
  }

  listen(...listener) {
    this.server.listen(...listener);
  }

  async incoming(client) {
    const  multi = multiplex();

    client.pipe(multi);
    multi.pipe(client);

    var control      = multi.createSharedStream('control');
    var remotestdout = multi.createStream('stdout');
    var remotestderr = multi.createStream('stderr');

    var data = await new Promise(resolve => control.once('data', resolve));

    data = JSON.parse(data);

    var child = spawn(data.cmd, data.args);

    var payload = { type : 'pid', pid : child.pid };
    control.write(JSON.stringify(payload));

    child.on('exit', function(code) {
      var payload = {
        type : 'event',
        event : 'exit',
        args : [code],
      };
      control.end(JSON.stringify(payload));
      client.end();
    });

    child.stdout.pipe(remotestdout);
    child.stderr.pipe(remotestderr);
  }
}


module.exports = Server;
