(function(host, port) {

var socket, console;

$(document).ready(init);

function init() {
  socket = io.connect( 'htp://localhost:' + port );
  socket.on('connected', onConnected);
  socket.on('disconnect', onDisconnected);
  socket.on('all', onEvent);
  console = $('#console ul');
}

function onConnected(e) {
  log('Connected to socket.io server', 'info');
}

function onDisconnected(e) {
  log('Disconnected from socket.io server', 'info');
}

function onEvent(e) {
  log('new event: ' + e.channel + ' (channel), ' + e.eventName + ' (eventName), ' + e.data + ' (data)', 'data');
}

function log(msg, type) {
  console.append('<li class="'+type+'">' + msg + '</li>');
}




}(window.config.host, window.config.port));
