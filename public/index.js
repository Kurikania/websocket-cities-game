const form = document.getElementById("form");
const input = document.getElementById('input');
const msg = document.getElementById('msg');
const newGameBtn = document.getElementById("newGameButton")
const joinGameBtn = document.getElementById("joinGameButton")
const gameCodeInput = document.getElementById('gameCodeInput')
const giveUpBtn = document.getElementById('giveUp')
// singlePlayer.addEventListener('click', newSingleGame)
let playerNumber
let gameActive = false;

newGameBtn.addEventListener('click', newGame);

joinGameBtn.addEventListener('click', joinGame);
giveUpBtn.addEventListener('click', giveUp);

socket.on('init', handleInit);
socket.on('gameCode', handleGameCode);
function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode;
}

function handleInit(number) {
  playerNumber = number;
}

function newGame() {
  socket.emit('newGame');
    init();
  }
  
  function joinGame() {
    if (gameCodeInput.value !== "") { 
    const roomName = gameCodeInput.value;
    socket.emit('joinGame', roomName);
    init();}
  }
  
  
  function init() {
    main.style.display = "none";
    gameScreen.style.display = "flex";
    gameActive = true;
  }

  socket.on('warning', function(msg){
    info.innerText = msg;
  });
  

  form.addEventListener("submit", function(e) {
    const roomName = gameCodeDisplay.innerText;
    if (!gameActive) {
      return;
    }
    e.preventDefault();
    console.log(roomName);
    let obj = {msg: input.value, roomName: roomName}
    socket.emit('chat message', obj);
    input.value = "";
  })
  
  socket.on('chat message', function(message){
    let li = document.createElement("li")
    li.innerText = (message)
    msg.appendChild(li);
  });
  
  function giveUp(e) {
    e.preventDefault()
    const roomName = gameCodeDisplay.innerText;
    socket.emit('gameOver', roomName);
    gameActive = false
  }

  socket.on('disable', function() {
    gameActive = false
  })
  
  
  socket.on('tooManyPlayers', handleTooManyPlayers);
  function handleTooManyPlayers() {
    reset();
    alert('This game is already in progress');
  }
  
  function reset() {
    playerNumber = null;
    gameCodeInput.value = '';
    initialScreen.style.display = "block";
    gameScreen.style.display = "none";
  }

