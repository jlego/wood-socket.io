
const SocketIo = require('./src/socket');

module.exports = (app = {}, config = {}) => {
  app.SocketIo = function(socketName, nameSpace, room) {
    app._socketIo = new Map();
    if (socketName && (nameSpace || room)) {
      if(app._socketIo.has(socketName)) return app._socketIo.get(socketName);
      const io = new SocketIo({ nameSpace,room });
      app._socketIo.set(socketName, io);
      return io;
    }
    return SocketIo;
  }
  if(app.addAppProp) app.addAppProp('SocketIo', app.SocketIo);
  return app;
}
