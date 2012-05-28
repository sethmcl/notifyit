var NotifyIt = require('../NotifyIt'),
    http     = require('http'),
    io       = require('socket.io-client'),
    PORT     = 2055,
    server   = new NotifyIt( PORT ).start(),
    socket   = connectSocketIO();

//----------- START OF TEST CASES ---------//

// POST some JSON data to the 'test' channel. We expect
// a 200 response, indicating that the server has accepted
// the data.
exports.testPublishValidJSON = function( test ) {
  test.expect(1);
  pubJSON( 'test', 'new-data', '{"name":"seth"}', function(res) {
    test.equal(res.statusCode, 200, 'HTTP 200 response expected');
    test.done();
  });
};

// POST some invalid JSON data to the 'test' channel. We expect
// a 500 response, indicating that the server couldn't parse
// the data.
exports.testPublishInvalidJSON = function( test ) {
  test.expect(1);
  pubJSON( 'test', 'new-data', '{name:"seth"}', function(res) {
    test.equal(res.statusCode, 500, 'HTTP 500 response expected');
    test.done();
  });
};

// Subscribe to a channel and make sure we receive the JSON
// data that is posted to that channel.
exports.testReceiveJSONDataFromChannel = function( test ) {
  test.expect(3);
  socket.on('test:new-data', function(e) {
    test.equal(e.channel, 'test', 'Channel name incorrect');
    test.equal(e.eventName, 'new-data', 'Event name incorrect');
    test.deepEqual(e.data, {name:'bob'}, 'Data incorrect');
    test.done();
  });
  pubJSON( 'test', 'new-data', '{"name":"bob"}', function(res) {} );
};

// Subscribe to a channel and make sure we receive the string
// data that is posted to that channel.
exports.testReceiveStrDataFromChannel = function( test ) {
  test.expect(1)
  socket.on('mychannel:sent', function(e) {
    test.equal(e.data, 'fee fi fo', 'Data incorrect');
    test.done();
  });
  pubStr( 'mychannel', 'sent', 'fee fi fo', function(res) {} );
};

// Subscribe to special 'all' channel, and make sure we receive the
// data that is posted to any channel
exports.testReceiveStrDataFromAllChannel = function( test ) {
  test.expect(1);
  socket.on('all', function(e) {
    test.equal(e.data, 'foo fi fo', 'Data incorrect');
    test.done();
  });
  pubStr( 'mychannel', 'sent' + Math.round(Math.random() * 100), 'foo fi fo', function(res) {} );
};

//----------- END OF TEST CASES ---------//

// Setup
exports.setUp = function( done ) {
  done();
};

// Teardown
exports.tearDown = function( done ) {
  done();
};

// Create socketio connection
function connectSocketIO() {
  return io.connect('http://localhost:'+PORT);
}

// Helper function to post JSON data to server
function pubJSON( channel, eventName, data, cb ) {
  pub( channel, eventName, data, 'application/json', cb );
}

// Helper function to post text data to server
function pubStr( channel, eventName, data, cb ) {
  pub( channel, eventName, data, 'text/plain', cb );
}

// Helper function to post data to publish endpoint on server
function pub( channel, eventName, data, contentType, cb ) {
  post( 'localhost', PORT, '/pub/'+channel+'/'+eventName, data, contentType, cb );
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
