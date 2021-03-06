const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http)
const { makeid } = require('./utils');
const { data} = require("./russia.js")
const PORT = process.env.PORT || 3000;
const path = require("path");
app.use(express.static(path.join(__dirname, '/views')));
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


app.get('/', (req, res) => {
    res.render(__dirname + '/index');
  });

app.get('/single-player', (req, res) => {
    res.render('single-player'); 
  });



const clientRooms = {};


io.on('connection', (client) => {
    console.log('a user connected');
    client.on('newGame', handleNewGame)
    client.on('joinGame', handleJoinGame)
    client.on('gameOver', handleGameOver);
    client.on('singleGame', handleNewSingleGame);
    client.on('chat message single', handleSingleGameMsg);
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
        if (clientRooms[roomName].users.length === 1) {
            client.emit('warning', "Подождите вашего соперника");
        } else { 
            if ( checkCity(msg) && msgs.length === 0) {
                msgs.push(msg);            
                client.emit('warning', "Ход вашего соперника");
                client.broadcast.emit('warning', 'Ваш ход!');
                io.to(roomName).emit('chat message', msg);
                clientRooms[roomName].activeUser = clientRooms[roomName].users[1]; 
                console.log(clientRooms[roomName].activeUser)
                console.log(msgs.length)
            } else {
                if (client.id === clientRooms[roomName].activeUser && checkCity(msg) === true 
                && msgs[msgs.length-1].slice(-1) === msg[0].toLowerCase()) {
                    console.log(clientRooms[roomName].activeUser, client.id)
                    msgs.push(msg);
                    console.log(msgs)
                    io.to(roomName).emit('chat message', msg);
                    client.emit('warning', "Ход вашего соперника");
                    client.broadcast.emit('warning', 'Ваш ход!');
                    clientRooms[roomName].activeUser === clientRooms[roomName].users[0] ? clientRooms[roomName].activeUser = clientRooms[roomName].users[1] :  clientRooms[roomName].activeUser = clientRooms[roomName].users[0] 
                } else if (client.id === clientRooms[roomName].activeUser 
                    && checkCity(msg) === true 
                    && (msgs[msgs.length-1].slice(-1) === "ь" || msgs[msgs.length-1].slice(-1) === "ы") 
                    && msgs[msgs.length-1].slice(-2, -1) === msg[0].toLowerCase() ) {
                    console.log(clientRooms[roomName].activeUser, client.id)
                    msgs.push(msg);
                    console.log(msgs)
                    io.to(roomName).emit('chat message', msg);
                    client.emit('warning', "Ход вашего соперника");
                    client.broadcast.emit('warning', 'Ваш ход!');
                    clientRooms[roomName].activeUser === clientRooms[roomName].users[0] ? clientRooms[roomName].activeUser = clientRooms[roomName].users[1] :  clientRooms[roomName].activeUser = clientRooms[roomName].users[0] 
                } else if (client.id !== clientRooms[roomName].activeUser) {
                    io.to(roomName).emit('warning', "Сейчас не ваш ход");
                    client.broadcast.emit('warning', 'Ваш ход!');
                 
                } else if (checkCity(msg) === false) {
                    io.to(roomName).emit('warning', "Мы не знаем такой город");
                }
            }
        }
        console.log(clientRooms[roomName].activeUser)
        })

    function handleNewSingleGame() {
        let roomName = client.id;
        clientRooms[roomName] = {}
        clientRooms[roomName].msg = []
        client.join(roomName);
        console.log(clientRooms);
    }
    
    function handleSingleGameMsg(msg){
        console.log("from handle" + clientRooms[client.id] + " " + client.id);
        let roomName = `${client.id}`;
        console.log(clientRooms[roomName])
        let msgs = clientRooms[roomName].msg
        let citiesMatch = []

            if((checkCity(msg) === true && msgs.length ===0 
            || (checkCity(msg) === true && msgs[msgs.length-1].slice(-1) === msg[0].toLowerCase()))
            && (msg.slice(-1) !== "ь") && (msg.slice(-1) !== "ы") ) {
                console.log("Did I? 140" , msg.slice(-1))
            msgs.push(msg); 
            io.to(roomName).emit('chat message single', msg);   
            for (let i = 0; i < data.length; i++) {
                    if (data[i].city[0].toLowerCase() ===  msg.slice(-1)) citiesMatch.push(data[i].city) 
                }     
                let newCity = citiesMatch[Math.floor(Math.random() * citiesMatch.length)];
                msgs.push(newCity); 
                io.to(roomName).emit('chat message single', newCity); 
            }

            else if((checkCity(msg) === true && msgs.length ===0)
            &&(msg.slice(-1) === "ь" || msg.slice(-1) === "ы") ) {
            console.log("Did I?")
            msgs.push(msg); 
            io.to(roomName).emit('chat message single', msg);   
            for (let i = 0; i < data.length; i++) {
                    if (data[i].city[0].toLowerCase() ===  msg.slice(-2, -1)) citiesMatch.push(data[i].city) 
                }     
                let newCity = citiesMatch[Math.floor(Math.random() * citiesMatch.length)];
                msgs.push(newCity); 
                io.to(roomName).emit('chat message single', newCity); 
            } 

            else if((checkCity(msg) === true && msgs.length ===0 
            || (checkCity(msg) === true && msgs[msgs.length-1].slice(-1) === msg[0].toLowerCase()))
            &&(msgs[msgs.length-1].slice(-1) === "ь" || msgs[msgs.length-1].slice(-1) === "ы") ) {
            console.log("Got here")
            msgs.push(msg); 
            io.to(roomName).emit('chat message single', msg);   
            for (let i = 0; i < data.length; i++) {
                    if (data[i].city[0].toLowerCase() ===  msg.slice(-2, -1)) citiesMatch.push(data[i].city) 
                }     
                let newCity = citiesMatch[Math.floor(Math.random() * citiesMatch.length)];
                msgs.push(newCity); 
                io.to(roomName).emit('chat message single', newCity); 

            } else if (checkCity(msg) === true 
            && (msgs[msgs.length-1].slice(-1) === "ь" || msgs[msgs.length-1].slice(-1) === "ы") 
            && msgs[msgs.length-1].slice(-2, -1) === msg[0].toLowerCase() ) {
                msgs.push(msg); 
                console.log("Got here")
                io.to(roomName).emit('chat message single', msg);   
                for (let i = 0; i < data.length; i++) {
                        if (data[i].city[0].toLowerCase() ===  msg.slice(-2, -1)) citiesMatch.push(data[i].city) 
                    }     
                let newCity = citiesMatch[Math.floor(Math.random() * citiesMatch.length)];
                msgs.push(newCity); 
                io.to(roomName).emit('chat message single', newCity);  
             
        } else if (checkCity(msg) !== true)  {
            io.to(roomName).emit('warning', "Мы не знаем такого города"); 
        }
    }
    
    function handleNewGame() {
        client.emit('warning', 'Подождите вашего соперника');
        let roomName = makeid(5);
        // clientRooms[client.id] = roomName;
        clientRooms[roomName] = {}
        clientRooms[roomName].msg = []
        clientRooms[roomName].users = []
        clientRooms[roomName].activeUser = '';
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

        console.log(!clientRooms[roomName])

        if (!clientRooms[roomName]) {
            client.emit('unknownCode');
            return;
        }

      else if(clientRooms[roomName].users.length > 1) {
            client.emit('tooManyPlayers');
            return;
      } else { 
      io.to(roomName).emit('warning', 'Ваш ход!');
    //   client.broadcast('warning', 'Ваш ход!');
      console.log("handle joing game code" + roomName)
      clientRooms[roomName].users.push(client.id);
      client.join(roomName);
      console.log("player Joined")
      console.log(clientRooms[roomName])
        client.number = 2;
        client.emit('init', 2);
        client.emit('gameCode', roomName);
      }
      }

    function handleGameOver(roomName) {
        let looser = "Игрок " + client.number + " сдался"; 
        io.sockets.in(roomName).emit('warning',looser);
        io.sockets.in(roomName).emit('disable')
    }

});


function checkCity(city) {       
    for (let i = 0; i <data.length; i++) {
       
        if (data[i].city.toLowerCase() === city.toLowerCase()) {
            return true
        }
    } 
    return false
}

http.listen(PORT, () => {
    console.log('listening on *:3000');
  });