"use strict";

const spawn = require('child_process').spawn;

const multiplex = require('multiplex');

const debug  = require('debug')('remote-cp:server');


const Server = function(stream, readable) {
  debug("new tcp client");

  const  armor = multiplex(incoming);
  (readable || stream).pipe(armor);
  armor.pipe(stream);
};


const incoming = async function(client) {

  const  multi = multiplex();
  client.pipe(multi); multi.pipe(client);

  const control      = multi.createSharedStream('control');
  const remotestdout = multi.createStream('stdout');
  const remotestderr = multi.createStream('stderr');
  const remotestdin  = multi.receiveStream('stdin');

  var data = await new Promise(resolve => control.once('data', resolve));
  data = JSON.parse(data);
  debug("Got payload", data);

  var child = spawn(...data.query);

  var payload = { type : 'pid', pid : child.pid };
  debug("ACK pid", payload);
  control.write(JSON.stringify(payload));

  control.on('data', function(data) {
    data = JSON.parse(data);
    debug("Got payload", data);
    if(data.type == 'kill')
      child.kill(data.signal);
  });

  ['close', 'error', 'exit'].map(function(event) {
    child.on(event, function(...args) {
      var payload = {type : 'event', event, args};
      debug("ACK ", event, payload);
      control.write(JSON.stringify(payload));
    });
  });

  if(child.stdin)
    remotestdin.pipe(child.stdin);
  if(child.stdout)
    child.stdout.pipe(remotestdout);
  if(child.stderr)
    child.stderr.pipe(remotestderr);
};



module.exports = Server;
