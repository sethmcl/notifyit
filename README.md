#NotifyIt

This is a simple PubSub tool which allows you to publish events via an HTTP POST interface, and subscribe to events via a [socket.io][] connection.

##Pre-reqs
To use this tool, you'll need to have [node.js][node] (v0.4 or greater) and [npm][] installed. I've tested the tool on OSX and Linux, but it should work fine on Windows as well.

[socket.io]: http://www.socket.io
[node]: http://nodejs.org/
[npm]: http://npmjs.org/

##Install

    git clone git://github.com/sethmcl/notifyit.git
    cd notifyit
    npm install

##Usage

To start the server, run:

    $ bin/notifyit [port]

You can optionally specify a port. If not port is specified, the default port of 2012 will be used.

##Publishing Events
To publish an event, post to the /pub endpoint on the server. For example to publish an event called "new-data" on the "test" channel, you could POST something like this:

    $ curl http://localhost:2012/pub/test/new-data -d "{\"name\":\"Seth\"}" -H "Content-Type:application/json" -v

By specifying the `Content-Type`, NotifyIt will attempt to parse the request body as JSON. If the parsing fails (due to malformed JSON), then the event will not be published
and you will receive a `500` HTTP response.

If you do not specify a content type, NotifyIt will assume the data is simple text. Let's publish an event called "connect" on the "test" channel:

    $ curl http://localhost:2012/pub/test/connect -d "name=Seth" -v

Try running these commands - you will see status output in the console where you are running the server.

##Subscribing to Events
Subscribing to events is pretty straightforward. Include the socket.io client library on your page or node.js script, and then subscribe to events. Example:

    var socket = io.connect('http://localhost:2012');
    socket.on('test:new-data', function(e) {
      console.log( e.channel ); // Channel name, e.g., 'test'
      console.log( e.event );   // Event name, e.g., 'new-data'
      console.log( e.data );    // Data, e.g., 'name:Seth'. If event data was published as JSON, then this will be an object.
    }

Alternatively, you can subscribe to the 'all' event to receive all events:

    var socket = io.connect('http://localhost:2012');
    socket.on('all', function(e) {
      console.log( e.channel ); // Channel name, e.g., 'test'
      console.log( e.event );   // Event name, e.g., 'new-data'
      console.log( e.data );    // Data, e.g., 'name:Seth'. If event data was published as JSON, then this will be an object.
    }

##Sample App
To see this in action, start the server:

    $ bin/notifyit

Then open a browser and go to `http://localhost:2012`.

Finally, publish a sample event with a curl command:

    $ curl http://localhost:2012/pub/test/connect -d "name=Seth"

You should see the event disaplayed in the browser.

##Running the Unit Tests

If you have not installed the nodeunit command before, please run these commands to build:

    $ cd node_modules/nodeunit
    $ sudo make install
    $ cd ../../

To execute the tests, run this command from the repository root:

    $ nodeunit tests/
