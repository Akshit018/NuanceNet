const chatMessage = document.querySelector(".message-area");
const chatForm = document.getElementById("chat-form");

//get username and room from url
const {username,room} = Qs.parse(location.search,{
    ignoreQueryPrefix : true
});

const botName = "NuanceNet"

console.log(username,room);

const socket = io();

//join chat room
socket.emit("joinRoom",{username,room});

//get other room users for rendering
socket.on("roomUsers", (obj) => {

    console.log(obj);

    const roomName = document.querySelector(".room-name h2");
    roomName.textContent = "Room Name : " + obj.room;

    const Memberslist = document.getElementById("members");

    const arr = obj.users;
    console.log(arr);

    Memberslist.innerHTML="";

    arr.forEach(e => {
        // Create a new list item for each user
        const liElement = document.createElement("li");
        liElement.textContent = e.username;
        Memberslist.appendChild(liElement);
    });
});


//message from server
socket.on("message",message=>{
    //console.log(message);
    if(message.username === botName){
        systemMessage(message.text);
    }else{
        outputMessage(message);
    }

    chatMessage.scrollTop = chatMessage.scrollHeight;
})

//adding event listener to the chat button
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    //const msg = e.target.elements.msg.value;
    const msg = e.target.querySelector('.message-input').value;
    socket.emit("chatMessage",msg);
    //clear input
    e.target.querySelector('.message-input').value='';
    e.target.querySelector('.message-input').focus();
})

//output message
function outputMessage(message){

    // Create message box container
    const messageBox = document.createElement('div');
    messageBox.classList.add('message-box');
    if(message.username===username){
        messageBox.classList.add('host-message');
    }else{
        messageBox.classList.add('non-host-message');
    }

    // Create sender name element
    const senderName = document.createElement('div');
    senderName.classList.add('sender-name');
    senderName.textContent = message.username;

    // Create message content element
    const messageContent = document.createElement('div');
    messageContent.classList.add('message');
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message.text;
    messageContent.appendChild(messageParagraph);

    // Create timestamp element
    const timestamp = document.createElement('div');
    timestamp.classList.add('tstamp');
    const timestampParagraph = document.createElement('p');
    timestampParagraph.textContent = message.time;
    timestamp.appendChild(timestampParagraph);

    // Append elements to message box container
    messageBox.appendChild(senderName);
    messageBox.appendChild(messageContent);
    messageBox.appendChild(timestamp);

    document.getElementById('message-area').appendChild(messageBox);

}

function systemMessage(text){

    const outDiv=document.createElement("div");
        outDiv.classList.add("tempp");

        const inDiv=document.createElement("div");
        inDiv.classList.add("system-message");

        const p = document.createElement("p");
        p.innerText= text;

        inDiv.appendChild(p);
        outDiv.appendChild(inDiv);

        document.getElementById('message-area').appendChild(outDiv);

}

