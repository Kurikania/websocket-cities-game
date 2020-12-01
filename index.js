var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const path = require("path");
app.use(express.static(path.join(__dirname, '/client')));
const { makeid } = require('./utils');
const { data} = require("./russia.js")


app.get('/', (req, res) => {
    res.render(__dirname + '/index.html');
  });


const clientRooms = {};

const users = [];


io.on('connection', (client) => {
    console.log('a user connected');
    client.on('newGame', handleNewGame)
    client.on('joinGame', handleJoinGame)
    client.on('disconnect', () => {
        console.log("chau")
    });



    client.on('chat message', (msg) => {   
        console.log(data[0]) 
        const roomName = clientRooms[client.id];
        console.log(clientRooms)
        const msgs = clientRooms[roomName];
        console.log(msgs)
        console.log(roomName)  
          
        if (msgs.length === 0) {
            msgs.push(msg);            
            io.to(roomName).emit('chat message', msg);
        } else {
            if (checkCity(msg) === true && msgs[msgs.length-1].slice(-1) === msg[0].toLowerCase()) {
                msgs.push(msg);
                console.log(msgs)
                io.to(roomName).emit('chat message', msg);
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
        clientRooms[client.id] = roomName;
        clientRooms[roomName] = []
       
        
        client.emit('gameCode', roomName);
    
        console.log(roomName)
        client.join(roomName);
        client.number = 1;
        client.emit('init', 1);
        
    }
    
    function handleJoinGame(roomName) {
        //const user = userJoin(client.id, username, room);
        let allUsers;
        if (room) {
          allUsers = room.sockets;
        }
    
        let numClients = 0;
        if (allUsers) {
          numClients = Object.keys(allUsers).length;
        }
    
        if (numClients === 0) {
          client.emit('unknownCode');
          return;
        } else if (numClients > 1) {
          client.emit('tooManyPlayers');
          return;
        }
    
        clientRooms[client.id] = roomName;
    
        client.join(roomName);
        client.number = 2;
        client.emit('init', 2);
      }
});


// function userJoin(id, username, room) {
  
//   return user;
// }

http.listen(3000, () => {
    console.log('listening on *:3000');
  });