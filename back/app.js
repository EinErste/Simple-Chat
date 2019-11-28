const express = require("express");
const port = process.env.PORT || 3000;
const app = express();
const messages = new Array();
const users = [{username: "SYSTEM",password:"123"},{username: "Moderator",password:"123"},
    {username: "Admin",password:"123"}];
const power = [{username: "SYSTEM",password:"123"},{username: "Moderator",password:"123"},
    {username: "Admin",password:"123"}];
let online = 0;
let counter = 0;
app.set("view engine","ejs");
app.use(express.static("front"));
app.get("/",(req,res)=>{
   res.render("../front/index");
});
server = app.listen(port);
const io = require("socket.io")(server);

io.on('connection', (socket) => {
    socket.emit("connection",messages);
    socket.username = "Anonymous";
    io.sockets.emit("online-counter",++online);
    socket.on("disconnect", function() {
        io.sockets.emit("online-counter",--online);
        if(socket.username == "Anonymous") return;
        sendSystemMessage(socket.username +" left chat");
    });

    socket.on("login", (user) => {
        if(user.username == "Anonymous") {
            socket.emit("alert","Reserved username");
            return;
        }
        if(checkLogged(user)){
            socket.emit("alert","User already logged");
            return;
        }
        if(isRegistered(user)){
            if(checkPassword(user)){
                if(socket.username!="Anonymous") {
                    sendSystemMessage(socket.username +" left chat");
                }
                if(checkPower(user.username)) {
                    socket.emit("power",true);
                } else {
                    socket.emit("power",false);
                }
                socket.username = user.username;
            } else {
                socket.emit("alert","Wrong login or password");
                return;
            }
        } else {
            if(!isValidUser(user)){
                socket.emit("alert","Password or login cannot contain space or length be <1 or >20");
                return;
            }
            if(socket.username!="Anonymous"){
                sendSystemMessage(socket.username +" left chat");
            }
            socket.emit("power",false);
            users.push(user);
            socket.username = user.username;
        }
        socket.emit("change-username",socket.username);
        sendSystemMessage(socket.username +" entered chat");
    });

    socket.on("new-message", (data) => {
        if(data.message.length<1) return;
        if(messages.length>1000) messages.shift();
        const messageObject = {message : data.message, username : socket.username, time : getTime(), id: counter++};
        messages.push(messageObject);
        io.sockets.emit("new-message", messageObject);
    });

    socket.on("delete-message-request",(data)=>{
        if(!checkPower(socket.username)){
            socket.emit("alert","Unauthorized access");
            return;
        }
        removeMessageById(data);
        io.sockets.emit("delete-message-confirmed", data);
    })
    function sendSystemMessage(string) {
        const messageObject = {message : string, username : "SYSTEM", time : getTime(), id: counter++};
        messages.push(messageObject);
        io.sockets.emit("new-message", messageObject);
    }

});

function getTime() {
    var now = new Date();
    var time = [now.getHours(), now.getMinutes(), now.getSeconds(),
        now.getDate(),now.getMonth()+1,now.getFullYear()];

    for(var i = 0; i < 3; i++) {
        if(time[i] < 10) {
            time[i] = '0' + time[i];
        }
    }

    return time[0]+":"+time[1]+":"+time[2]+" "+ time[3]+"."+ time[4]+"."+ time[5];
}

function isRegistered(user) {
    for (let i = 0; i < users.length; i++) {
        if(user.username==users[i].username) return true;
    }
    return false;
}

function checkPassword(user) {
    for (let i = 0; i < users.length; i++) {
        if(user.password==users[i].password) return true;
    }
    return false;
}

function isValidUser(user) {
    if(user.username.includes(" ")||user.password.includes(" ")) return false;
    // if(user.username==""||user.password=="") return false;
    if(user.username.length>20 ||user.username.length<1||
        user.password.length>20 ||user.password.length<1)
        return false;
    return true;
}
function checkLogged(user) {
    const sockets = io.sockets.sockets;
    for(var socketId in sockets) {
        if(sockets[socketId].username==user.username){
            return true;
        }
    }
    return false;
}

function checkPower(username) {
    for (let i = 0; i < power.length; i++) {
        if(username==power[i].username) {
            return true;
        }
    }
    return false;
}

function removeMessageById(id) {
    for (let i = 0; i < messages.length; i++) {
        if(id==messages[i].id) {
            messages.splice(i,1);
            break;
        }
    }
}