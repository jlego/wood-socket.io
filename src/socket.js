const Io = require("socket.io");
const IORedis = require("ioredis");
const redisAdapter = require("socket.io-redis");

let socketIo = null;

class SocketIo {
  constructor(opts = {}) {
    this.nameSpace = opts.nameSpace;
    this.room = opts.room;
    this.io = null;
    this.clusterConfig = opts.clusterConfig;
    this.initCluster();
    this.getIo();
  }

  // 初始化服务
  init(config) {
    socketIo = Io(config.server, {
      pingInterval: config.pingInterval || 10000,
      pingTimeout: config.pingTimeout || 5000,
      cookie: config.cookie || false
    });
  }

  // 集群
  initCluster() {
    if (this.clusterConfig && Array.isArray(this.clusterConfig)) {
      socketIo.adapter(
        redisAdapter({
          pubClient: new IORedis.Cluster(this.clusterConfig),
          subClient: new IORedis.Cluster(this.clusterConfig)
        })
      );
    }
  }

  getIo() {
    if (this.io) return this.io;
    this.io = socketIo;
    if (this.nameSpace) this.io = this.io.of(this.nameSpace);
    if (this.room) this.io = this.io.in(this.room);
    return this.io;
  }

  setOnMsgListener(callback) {
    this.io.on("message", msg => {
      callback(msg);
    });
  }

  setOnConnListener(listeners, callback) {
    this.io.on("connection", onConn);
    let self = this;
    function onConn(socket) {
      callback(socket);
      const { custom, customEmit, onDiscon, onError } = listeners;
      if (custom) self.setCustomListener(socket, custom);
      if (customEmit) self.setCustomEmit(socket, customEmit);
      if (onDiscon) self.setOnDisconListener(socket, onDiscon);
      if (onError) self.setOnErrorListener(socket, onError);
    }
  }

  setCustomListener(socket, listeners) {
    if (!Array.isArray(listeners)) listeners = [listeners];
    for (let i of listeners) {
      const { event, cb } = i;
      return socket.on(event, cb);
    }
  }

  setCustomEmit(socket, customEmit) {
    if (!Array.isArray(customEmit)) customEmit = [customEmit];
    for (let i of customEmit) {
      socket.emit(i);
    }
  }

  getNspClients(nameSpace) {
    return this.io.of(nameSpace).clients((err, clients) => {
      if (err) throw err;
      return clients;
    });
  }

  setOnDisconListener(socket, listeners) {
    if (!Array.isArray(listeners)) listeners = [listeners];
    for (let i of listeners) {
      const { cb } = i;
      socket.on("disconnecting", cb);
    }
  }

  setOnErrorListener(socket, listeners) {
    if (!Array.isArray(listeners)) listeners = [listeners];
    for (let i of listeners) {
      const { cb } = i;
      socket.on("error", cb);
    }
  }
}

module.exports = SocketIo;
