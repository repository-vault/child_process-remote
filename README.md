
[![Build Status](https://travis-ci.org/131/remote-cp.svg?branch=master)](https://travis-ci.org/131/remote-cp)
[![Coverage Status](https://coveralls.io/repos/github/131/remote-cp/badge.svg?branch=master)](https://coveralls.io/github/131/remote-cp?branch=master)
[![Version](https://img.shields.io/npm/v/child_process-remote.svg)](https://www.npmjs.com/package/child_process-remote)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](http://opensource.org/licenses/MIT)
[![Code style](https://img.shields.io/badge/code%2fstyle-ivs-green.svg)](https://www.npmjs.com/package/eslint-plugin-ivs)


# Motivation

Execute a remote process throught a remote TCP endoint


# API

```client.js
//assume server is running on 
var spawn = require('child_process-remote/spawn')(8080);

var version = '';
var child = spawn('node', ['-v']);
child.stdout.on('data', function(line) {
  version = line;
})

child.on('close', function(exit) {
  console.log('All done, version is %s , exit code is %d', version, exit);
});
```

```server.js
var Server = require('child_process-remote/server');
var server = new Server();
server.listen(8080, function() {
  console.log("Server is now ready");
});
```







# Credits 
* [131](https://github.com/131)

