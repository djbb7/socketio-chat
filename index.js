var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var users = {};
var rusers = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    socket.broadcast.emit('chat message', users[socket.id]+": "+msg);
  });

  socket.on('joined', function(user){
  	socket.broadcast.emit('joined', user+' joined chat');
  	socket.join(socket.id);
  	users[socket.id] = user;
  	rusers[user] = socket.id;
  });

  socket.on('pm', function(msg){
  	var dest = msg.match(/(?:[^\s]+)/);
  	//get channel
  	var channel = rusers[dest];
  	//socket.join(channel);
  	socket.broadcast.to(channel).emit('chat message', users[socket.id]+" (private): "+msg.substring(dest.length+1));
  });

  socket.on('disconnect', function(){
    io.emit('left', users[socket.id]+' disconnected');
  });

  socket.on('typing', function(user){
  	console.log(user + " is typing");
  	socket.broadcast.emit('typing', user+" is typing...");
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
