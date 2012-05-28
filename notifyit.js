'use strict';

var PORT           = 2012,
    express        = require('express'),
    crypto         = require('crypto'),
    hostname       = require('os').hostname(),
    colors         = require('colors'),
    path           = require('path'),
    app            = express.createServer(),
    io             = require('socket.io'),
    _              = require('underscore'),
    homeFolder, port;

/**
 * Constructor
 */
function NotifyIt( port ) {
  initEnvironment( port );
  initRouting();
  initSocketIO();

  /**
   * Setting up environment
   */
  function initEnvironment( serverPort ) {
    homeFolder = __dirname;
    console.log('   info  -'.cyan, 'NotifyIt root'.yellow, homeFolder);

    // express config
    app.set('view engine', 'ejs');
    app.set('views', homeFolder + '/views');
    app.set('views');
    app.set('view options', { layout: null });

    app.use (function(req, res, next) {
        var data='';
        req.setEncoding('utf8');
        req.on('data', function(chunk) { 
           data += chunk;
        });

        req.on('end', function() {
            req.body = data;
            next();
        });
    });

    // static resources
    app.use('/js', express.static(homeFolder + '/js'));
    app.use('/css', express.static(homeFolder + '/css'));
    app.use('/images', express.static(homeFolder + '/images'));

    // port
    port = serverPort || parseInt(process.argv[2], 10) || PORT;
  }

  /**
   * Init service routing
   */
  function initRouting() {
    /** Index page. */
    app.get('/', function(request, response) {
      response.render('index', { host: hostname, port: port });
    });

    /** Post new result */
    app.post('/pub/:channel/:eventName', routePubRequest );
  }

  /**
   * Handle HTTP request to publish data
   */
  function routePubRequest(request, response) {
    var data      = request.body,
        channel   = request.params.channel,
        eventName = request.params.eventName,
        obj;

    if(request.is('json')) {
      try {
        obj = JSON.parse(data);
      } catch(e) {
        response.send('Malformed JSON', 500);
      }
    } else {
      obj = data;
    }

    if(obj) {
      publish( channel, eventName, obj );
    }

    response.send(200);
  }

  /**
   * Publish data to listeners
   */
  function publish( channel, eventName, obj ) {
    var evt     = channel + ':' + eventName,
        wrapper = {
          channel:   channel,
          eventName: eventName,
          data:      obj
        };


    console.log('   info -'.cyan, 'publishing event'.white, evt.yellow, 'with data'.white, obj.toString().yellow);
    io.sockets.emit(evt, wrapper);
    io.sockets.emit('all', wrapper);
  }

  /**
   * Socket io initialization
   */
  function initSocketIO() {
    io = io.listen(app);
    io.set('log level', 1);

    io.sockets.on('connection', function onConnection(socket) {
      socket.emit('connected');
    });
  }

  /**
   * Start server
   */
  function start() {
    app.listen(port);
    console.log('NotifyIt started on'.yellow, (hostname + ':' + port).cyan);
  }

  /**
   * Stop server
   */
  function stop() {
    app.close();
    console.log('NotifyIt shutting down'.yellow);
  }

  return {
    start: start,
    stop: stop
  };
}

module.exports = NotifyIt;
