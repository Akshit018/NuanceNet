const express = require("express");
const {createServer} = require("http");
const socketio = require("socket.io");
const moment = require('moment');
const path = require('path');
require('dotenv').config()

const app = express();
const server = createServer(app);
const io = socketio(server);

const PORT = process.env.PORT || 3000;

//set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName = "NuanceNet"
let users = [];

//join user to chat
function userjoin(id,username,room){
    let user = {id,username,room};
    users.push(user);
    return user;
}

//get current user
function getCurrentUser(id){
    return users.find(user=> user.id===id);
}

//user leaves chat
function userLeave(id){
    let idx = users.findIndex(user => user.id===id);
    if(idx!=-1){
        return users.splice(idx,1)[0];
    }
}

//get room user
function getRoomUsers(room){
    return users.filter(user=>user.room===room);
}

//format message
function formatMessage(username,text){
    return {
        username,
        text,
        time: moment().format("h:mm:ss a")
    }
}


io.on("connection", socket=>{

    //when a user joins 
    socket.on("joinRoom",({username,room})=>{

        const user = userjoin(socket.id,username,room);

        //join the room
        socket.join(user.room);

        //braodcast the message that a user has joined to evryone
        io.to(user.room).emit("message",formatMessage(botName,`${user.username} has joined the chat.`));
        
        //send room users to every one in the room
        io.to(user.room).emit("roomUsers",{
            room : user.room,
            users : getRoomUsers(user.room)
        })

    })

    //listen for chat messages
    socket.on("chatMessage",msg=>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit("message",formatMessage(user.username,msg));
    })

    //when user dissconnects
    socket.on("disconnect",()=>{
        const user = userLeave(socket.id);
        if(user){
            //notify other users that someoen has dissconected
            io.to(user.room).emit("message",formatMessage(botName,`${user.username} has left the chat`))
            //update the room users list
            io.to(user.room).emit("roomUsers",{
                room : user.room,
                users : getRoomUsers(user.room)
            })
        }
    })

});

// app.get("/", (req, res) => {
//     res.sendFile(path.join(__dirname, "public", "index.html"));
//     console.log("dcwadc");
// });

server.listen(PORT,()=>{
    console.log(`server is running at port ${PORT} `);
})