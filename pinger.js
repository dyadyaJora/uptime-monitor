let ipc = require('node-ipc');
let config = require('./config');

ipc.config.id = config.ipcId;
ipc.config.retry = 1500;

ipc.serveNet('localhost', 3003, () => {
  ipc.server.on(
    'message',
    function (data, socket) {
      ipc.log('got a message : '.debug, data);
      makePing(data);
      socket.destroy();
    }
  );
}
);

ipc.server.start();

/**
 * Must have
 */
function makePing(data) {

}