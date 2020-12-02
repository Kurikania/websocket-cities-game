const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const path = require("path");
app.use(express.static(path.join(__dirname, '/client')));
const { makeid } = require('./utils');
const { data} = require("./russia.js")


app.get('/', (req, res) => {
    res.render(__dirname + '/index.html');
  });


const clientRooms = {};


io.on('connection', (client) => {
    console.log('a user connected');
    client.on('newGame', handleNewGame)
    client.on('joinGame', handleJoinGame)
    client.on('gameOver', handleGameOver);
    client.on('disconnect', () => {
        console.log(client.number + "chau")
    });

    client.on('chat message', (obj) => {   
        console.log("the obj"+obj)
        let {roomName, msg } = obj
        console.log("the obj"+ roomName, msg)
        console.log(clientRooms) 
        console.log(clientRooms[roomName])
        const msgs = clientRooms[roomName].msg;
        console.log(msgs)
        console.log(roomName)  
        console.log(clientRooms[roomName].users)  

        if (msgs.length === 0) {
            msgs.push(msg);            
            io.to(roomName).emit('chat message', msg);
            activeUser = clientRooms[roomName].users[1]; 
            console.log(activeUser)
            console.log(msgs.length)
        } else {
            if (client.id === activeUser && checkCity(msg) === true 
            && msgs[msgs.length-1].slice(-1) === msg[0].toLowerCase()) {
                console.log(activeUser, client.id)
                msgs.push(msg);
                console.log(msgs)
                io.to(roomName).emit('chat message', msg);
                activeUser === clientRooms[roomName].users[0] ? activeUser = clientRooms[roomName].users[1] :  activeUser = clientRooms[roomName].users[0] 
            }
        }
    })

    function checkCity(city) {       
        for (let i = 0; i <data.length; i++) {
           
            if (data[i].city.toLowerCase() === city.toLowerCase()) {
                return true
            }
        } 
        return false
    }
    
    
    function handleNewGame() {
        let roomName = makeid(5);
        // clientRooms[client.id] = roomName;
        clientRooms[roomName] = {}
        clientRooms[roomName].msg = []
        clientRooms[roomName].users = []
        clientRooms[roomName].users.push(client.id);
        console.log(clientRooms[roomName])
        
        
        client.emit('gameCode', roomName);
    
        console.log(roomName)
        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
        let activeUser = clientRooms[roomName].users[0];
        
    }
    
    function handleJoinGame(roomName) {

      if(clientRooms[roomName].users.length> 1) {
            client.emit('tooManyPlayers');
            return;
      }
     
      console.log("handle joing game code" + roomName)
      clientRooms[roomName].users.push(client.id);
      client.join(roomName);
      console.log("player Joined")
      console.log(clientRooms[roomName])
        client.number = 2;
        client.emit('init', 2);
        client.emit('gameCode', roomName);
      }

    function handleGameOver(roomName) {
        let looser = client.number; 
        emitGameOver(roomName, looser);
    }

});

function emitGameOver(room, looser) {
    io.sockets.in(room)
      .emit('gameFinished', JSON.stringify({ looser }));
  }

http.listen(3000, () => {
    console.log('listening on *:3000');
  });