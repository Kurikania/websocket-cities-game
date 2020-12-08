const form = document.getElementById("form");
const input = document.getElementById('input');
const msg = document.getElementById('msg');
// const giveUpBtn = document.getElementById('giveUp')

function newSingleGame() {
    socket.emit('singleGame');
  } 

 newSingleGame() 

  socket.on('warning', function(msg){
    info.innerText = msg;
  });
  

  form.addEventListener("submit", function(e) {
    e.preventDefault();
    let msg =  input.value;
    socket.emit('chat message single', msg);
    input.value = "";
  })
  
  socket.on('chat message single', function(message){
    let li = document.createElement("li")
    li.innerText = (message)
    msg.appendChild(li);
  });
  
//   function giveUp(e) {
//     e.preventDefault()
//     const roomName = gameCodeDisplay.innerText;
//     socket.emit('gameOver', roomName);
//     gameActive = false
//   }

  socket.on('disable', function() {
    gameActive = false
  })
  
  
  function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
  }
