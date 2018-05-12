"use strict";

const net = require('net');
const EventEmitter = require('events');
const multiplex = require('multiplex');
const debug  = require('debug')('remote-cp:client');


class RemoteProcess extends EventEmitter {
  constructor(props) {
    super();
    Object.assign(this, props);
  }
}

const createClient = (...remote) => {

  return function(...query)  {

    const multi = multiplex();

    var lnk = net.connect(...remote, function() {
      debug('Connected to', ...remote);
    });

    lnk.pipe(multi);
    multi.pipe(lnk);

    var control = multi.createSharedStream('control');

    var payload = {query};
    debug('Send payload', payload);

    control.write(JSON.stringify(payload));

    var rp = new RemoteProcess({
      stdout : multi.receiveStream('stdout'),
      stderr : multi.receiveStream('stderr'),
      stdin  : multi.createStream('stdin'),
      kill   : (signal) => {
        var payload = {type : 'kill', signal};
        debug('Send payload', payload);
        control.write(JSON.stringify(payload));
      },
      pid    : 0,
    });

    control.on('data', function(data) {
      data = JSON.parse(data);

      if(data.type == 'pid')
        rp.pid = data.pid;
      if(data.type == 'event')
        rp.emit(data.event, ...data.args);
    });

    return rp;
  };
};


module.exports = createClient;
