let ipc = require('node-ipc');
let mongoose = require('mongoose');
let config = require('./config');

require('./models/site');

mongoose.Promise = Promise;
mongoose.connect(config.mongodbUri);

mongoose.connection.on('error', function (err) {
  console.error('Database Connection Error: ' + err);
});

mongoose.connection.on('connected', function () {
  console.info('Succesfully connected to MongoDB Database');
});

let Site = mongoose.model('Site');
let currentTime = new Date().getTime();

ipc.config.id = config.ipcId;
ipc.config.stopRetrying = true;

Site.find({in_query: false})
  .then(items => {
    items.forEach(item => {
      if(new Date(item.last_update).getTime() + item.delay < currentTime) {
        Site.update({ _id: item._id }, { $set: { in_query: true } }, (err, site) => {
          ipc.connectToNet(
            config.ipcId,
            config.baseHost,
            config.tcpSocketPort,
            function () {
              ipc.of[config.ipcId].emit(
                'message',
                {_id: site._id, url: site.url}
              );
            }
          );
        });
      }
    });
  })
  .catch(err => {

  });

setTimeout(function () {}, 5000);