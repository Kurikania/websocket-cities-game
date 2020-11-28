

// socket.on('init', handleInit);
// socket.on('gameState', handleGameState);
// socket.on('gameOver', handleGameOver);
// socket.on('gameCode', handleGameCode);
// socket.on('unknownCode', handleUnknownCode);
// socket.on('tooManyPlayers', handleTooManyPlayers);


const form = document.getElementById("form");
const input = document.getElementById('input');
const msg = document.getElementById('msg');


form.addEventListener("submit", function(e) {
    e.preventDefault();
    socket.emit('chat message', input.value);
    input.value = ""
})

socket.on('chat message', function(message){
    let li = document.createElement("li")
    li.innerText = (message)
    msg.appendChild(li);
  });