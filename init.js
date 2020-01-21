
const SocketIo = require('./src/socket');

module.exports = (app = {}, config = {}) => {
  config.server = app.application.get('httpServer');
  const socketIo = new SocketIo();
  socketIo.init(config);
}
