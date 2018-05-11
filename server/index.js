"use strict";

const net = require('net');
const spawn = require('child_process').spawn;

const multiplex = require('multiplex');
const debug  = require('debug')('remote-cp:server');

class Server {

  constructor() {
    this.server = net.createServer(this.incoming);
  }

  listen(...listener) {
    this.server.listen(...listener);
  }

  async incoming(client) {
    debug("new tcp client");

    const  multi = multiplex();

    client.pipe(multi);
    multi.pipe(client);

    var control      = multi.createSharedStream('control');
    var remotestdout = multi.createStream('stdout');
    var remotestderr = multi.createStream('stderr');

    var data = await new Promise(resolve => control.once('data', resolve));
    data = JSON.parse(data);
    debug("Got payload", data);

    var child = spawn(...data.query);

    var payload = { type : 'pid', pid : child.pid };
    debug("ACK pid", payload);
    control.write(JSON.stringify(payload));

    const fw = function(event) {
      child.on(event, function(...args) {
        var payload = {type : 'event', event, args};
        debug("ACK ", event, payload);
        control.write(JSON.stringify(payload));
      });
    }

    fw('close'); fw('error'); fw('exit');

    if(child.stdout)
      child.stdout.pipe(remotestdout);
    if(child.stderr)
      child.stderr.pipe(remotestderr);
  }
}


module.exports = Server;
