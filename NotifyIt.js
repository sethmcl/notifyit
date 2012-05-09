var Class = require('jsface').Class;

Class(function() {
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

  return {
    /**
     * Constructor
     */
    constructor: function() {
      this.initEnvironment();
      this.initRouting();
      this.initSocketIO();
      this.start();
    },

    /**
     * Setting up environment
     */
    initEnvironment: function() {
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
      port = parseInt(process.argv[2], 10) || PORT;
    },

    /**
     * Init service routing
     */
    initRouting: function() {
      var waitForLoaded = this.waitForLoaded;

      /** Index page. */
      app.get('/', function(request, response) {
        response.render('index', { hostname: hostname, port: port });
      });

      /** Post new result */
      app.post('/result', function(request, response) {
        response.send(request.body);
      });

    },

    /**
     * Socket io initialization
     */
    initSocketIO: function() {
      io = io.listen(app);
      io.set('log level', 1);
      io.sockets.on('connection', _.bind(onConnection, this));
      function onConnection(socket) {
        var socketId = socket.id;
        socket.emit('connected');
      }
    },

    /**
     * Start server
     */
    start: function() {
      app.listen(port);
      console.log('NotifyIt started on'.yellow, (hostname + ':' + port).cyan);
    },

    /**
     * Main entry point
     */
    main: function(NotifyIt) {
      module.exports = NotifyIt;
    }
  };
});
