

const form = document.getElementById("form");
const input = document.getElementById('input');
const msg = document.getElementById('msg');
const newGameBtn = document.getElementById("newGameButton")
const joinGameBtn = document.getElementById("joinGameButton")
const gameCodeInput = document.getElementById('gameCodeInput')
const giveUpBtn = document.getElementById('giveUp')
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
    const roomName = gameCodeInput.value;
    socket.emit('joinGame', roomName);
    init();
  }
  
  
  function init() {
    initialScreen.style.display = "none";
    gameScreen.style.display = "block";
    gameActive = true;
    
  }
  
  form.addEventListener("submit", function(e) {
    e.preventDefault();
    const roomName = gameCodeDisplay.innerText;
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
  
  function giveUp() {
    socket.emit('gameOver')
  }

  socket.on('gameFinished', function() {
    if (!gameActive) {
      return;
    }
    data = JSON.parse(data);
  
    gameActive = false;
  
    if (data.looser === playerNumber) {
      alert('You Win!');
    } else {
      alert('You Lose :(');
    }
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