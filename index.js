const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const rooms = require('./rooms');;
const roomclass = require("./room");
roomclass.init(io);

const PORT = 6969;
const DIR = __dirname + "/frontend/";

app.get('/', (req, res) => {
  res.sendFile(DIR + 'index.html');
});
app.get('/style.css', (req, res) => {
  res.sendFile(DIR + 'style.css');
})
app.get('/socket.js', (req, res) => {
  res.sendFile(DIR + 'socket.js');
})
app.get('/pong.js', (req, res) => {
  res.sendFile(DIR + 'pong.js');
})

server.listen(PORT, () => {
  console.log('Listening on:', PORT);
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.emit("userid", socket.id);

  socket.on('joingame', (args) => {
    rooms.joinroom(args.id, args.isprivate, args.privateroomid, socket);
    console.log("ARGS: ", args);
  })
  socket.on("createprivateroom", (args) => {
    rooms.createprivateroom(args.userid, socket);
  })
  socket.on('update', data => {
    rooms.update(data.roomid, data.data);
  })
  socket.on('gameover', roomid => {
    rooms.deleteroom(roomid);
  })
});