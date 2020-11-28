var express = require('express');
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http)
const path = require("path");
app.use(express.static(path.join(__dirname, '/client')));


app.get('/', (req, res) => {
    res.render(__dirname + '/index.html');
  });

const state = {};
const clientRooms = {};
const msgs = [];


io.on('connection', (client) => {
    console.log('a user connected');
    client.on('disconnect', () => {
        console.log("chau")
    });
    client.on('chat message', (msg) => {
        msgs.push(msg);
        io.emit('chat message', msg);
        console.log(msgs)
    } 
 )
});



http.listen(3000, () => {
    console.log('listening on *:3000');
  });