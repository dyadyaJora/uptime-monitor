let ipc = require('node-ipc');
let request = require('request');
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
  request({
    url: data.url
  }, (err, res, body) => {
    let p = new Promise((resolve, reject) => {
      _curStatus = res && res.statusCode;

      if (err || data.status_content != _curStatus) {
        console.log('xxx3');
        _text += isSuccess(_curStatus)? 
          'Сайт <a href="' + data.url + '"> url</a> недоступен.' :
          'Сайт <a href="' + data.url + '"> url</a> теперь доступен.';

        doAlarm();
      }

      if (!isSuccess(_curStatus)) {
        throw new Error({ status_err: true, status: _curStatus });
        return;
      }
      resolve()
    });

    p.then(() => {
      return Site.findByIdAndUpdate(_doc._id, { current_content: body, last_update: new Date() });
    })
    .catch((err) => {
      console.log(err, "ERROR in timer for " + _doc.url);
      if (err.status_err) {
        if (data.status_content != err.status) {
          Site.findByIdAndUpdate(data._id, { status_content: err.status });
          doAlarm();
        }
      }
    })
  });
}

/**
 * Must have
 */
function isSuccess(num) {
  return num >= 200 || num < 300
}

/**
 * Must have
 */
function doAlarm() {
  // todo
}