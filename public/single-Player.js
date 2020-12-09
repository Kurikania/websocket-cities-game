const form = document.getElementById("form");
const input = document.getElementById('input');
const msg = document.getElementById('msg');

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
    info.innerText = "Вы играете против компьютера";
  })
  
  socket.on('chat message single', function(message){
    let li = document.createElement("li")
    li.innerText = (message)
    msg.appendChild(li);
  });


  

