let b = new SocketIo('test', 'test');
const listeners = {
  custom: [{
    event: 'testEvent',
    cb: function(msg) {
      console.log('testEvent:'+ msg);
    }
  }],
  onDiscon: {
    cb: function() {
      console.log('leave');
    }
  }
}
b.setOnConnListener(listeners, function(socket) {
  console.log(socket)
})