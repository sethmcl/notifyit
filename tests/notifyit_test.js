var NotifyIt = require('../NotifyIt'),
    http     = require('http'),
    io       = require('socket.io-client'),
    PORT     = 2055,
    server   = new NotifyIt( PORT ),
    socket;

//----------- START OF TEST CASES ---------//

// POST some JSON data to the 'test' channel. We expect
// a 200 response, indicating that the server has accepted
// the data.
exports.testPublishValidJSON = function( test ) {
  test.expect(1);
  pubJSON( 'test', '{"name":"seth"}', function(res) {
    test.equal(res.statusCode, 200, 'HTTP 200 response expected');
    test.done();
  });
};

// POST some invalid JSON data to the 'test' channel. We expect
// a 500 response, indicating that the server couldn't parse
// the data.
exports.testPublishInvalidJSON = function( test ) {
  test.expect(1);
  pubJSON( 'test', '{name:"seth"}', function(res) {
    test.equal(res.statusCode, 500, 'HTTP 500 response expected');
    test.done();
  });
};

// Subscribe to a channel and make sure we receive the JSON
// data that is posted to that channel.
exports.testReceiveJSONDataFromChannel = function( test ) {
  socket.on('test:new-data', function(data) {
    test.deepEqual(data, {name:'bob'}, 'Data incorrect');
    test.done();
  });
  pubJSON( 'test', '{"name":"bob"}', function(res) {} );
};

// Subscribe to a channel and make sure we receive the string
// data that is posted to that channel.
exports.testReceiveStrDataFromChannel = function( test ) {
  socket.on('mychannel:new-data', function(data) {
    test.equal(data, 'fee fi fo', 'Data incorrect');
    test.done();
  });
  pubStr( 'mychannel', 'fee fi fo', function(res) {} );
};

//----------- END OF TEST CASES ---------//

// Setup
exports.setUp = function( done ) {
  socket = connectSocketIO();
  server.start();
  done();
};

// Teardown
exports.tearDown = function( done ) {
  server.stop();
  done();
};

// Create socketio connection
function connectSocketIO() {
  return io.connect('http://localhost:2055');
}

// Helper function to post JSON data to server
function pubJSON( channel, data, cb ) {
  pub( channel, data, 'application/json', cb );
}

// Helper function to post text data to server
function pubStr( channel, data, cb ) {
  pub( channel, data, 'text/plain', cb );
}

// Helper function to post data to publish endpoint on server
function pub( channel, data, contentType, cb ) {
  post( 'localhost', PORT, '/pub/'+channel, data, contentType, cb );
}

// Helper function to post data to server
function post( host, port, path, data, contentType, cb ) {
  var options = {
    host: host,
    port: port,
    path: path,
    method: 'POST',
    headers: { 'Content-Type': contentType }
  };

  var req = http.request(options, function(res) {
    res.responseData = '';

    res.on('data', function(chunk) {
      res.responseData += chunk;
    });

    res.on('end', function() {
      cb(res);
    });
  });

  req.write(data);
  req.end();
}
