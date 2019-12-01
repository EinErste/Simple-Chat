const path = require('path');
const mysql = require('mysql');
const express = require("express");
const sanitizeHtml = require('sanitize-html');
const sanitizeSettings = {
    allowedTags: ["br"],
};

const port = process.env.PORT || 8000;
const app = express();
//Administration nicks
const power =["SYSTEM","Admin","Moderator"];
//Current online
let online = 0;
//Last message id in table
let counter = 0;
//Max storage 5MB, each char 4B, roughly calculated 4*1500*700= 5MB
const maxMessages = 700;
const maxChars = 1500;
const nickRegex = /[0-9a-zA-Z*]{4,14}/;
const passRegex = /[0-9a-zA-Z*]{4,14}/;
// const passRegex = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z*]{3,14}/;
app.set('views', path.join(__dirname,"/views"));
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, './public')));
app.use(express.static("front"));
app.get("/",(req,res)=>{res.render("index");});
server = app.listen(port);
const io = require("socket.io")(server);

//Connect to MySQL
const mysql_connection = mysql.createConnection({
    host     : 'eu-cdbr-west-02.cleardb.net',
    user     : 'b7737bc41e5c98',
    password : '0ef8f3ce',
    database : 'heroku_e66901051ec4116'
});

mysql_connection.connect(function(err) {
    if (err) {
        console.log("SQL not connected");
    } else {
        console.log("SQL connected!");
    }
});

//Prevent SQL timeout idle
setInterval(() => {
    mysql_connection.query('SELECT 1', (error) => {
        console.log("ping");
        if (error) throw error;
    });
}, 50000);

//Last message id
getCounter().then(data=>{
   if(data!=undefined) counter = data.id + 1;
});
//Set encoding to normal UTF-8(sql is weird)
mysql_connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci",(err,result)=>{
    if(err){
        mysql_connection.query("SHOW VARIABLES WHERE Variable_name LIKE " +
            "'character\\_set\\_%' OR Variable_name LIKE 'collation%';",(err,result)=>{
            console.log(result);
        });
        throw err;
    }
})

//Socket io
io.on('connection', (socket) => {
    //Init new socket with info
    socketEmitInit();
    socket.username = "Anonymous";
    //Update all socket counters
    io.sockets.emit("online-counter",++online);
    //Update all socket counters and send leave message
    socket.on("disconnect", function() {
        io.sockets.emit("online-counter",--online);
        if(socket.username == "Anonymous") return;
        sendSystemMessage(socket.username +" left chat");
    });
    //Login logic
    socket.on("login", async (user) => {
        if(!isValidUser(user)){
            socket.emit("alert","Password or login length cannot " +
                "be <4 or >15. Must contain only a-z, A-Z and 0-9");
            return;
        }
        if(checkLogged(user)){
            socket.emit("alert","User already logged");
            return;
        }
        const passwordSQL = await getPassword(user);
        //User is registered
        if(passwordSQL!=undefined){
            if(passwordSQL.pass==user.password){
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
        //Register new user
        } else {
            if(socket.username!="Anonymous"){
                sendSystemMessage(socket.username +" left chat");
            }
            socket.emit("power",false);
            await addUsersSQL(user);
            socket.username = user.username;
        }
        socket.emit("change-username",socket.username);
        sendSystemMessage(socket.username +" entered chat");
    });

    //Get message from single socket, add to SQL, broadcast to others.
    socket.on("new-message", (data) => {
        let message = sanitizeHtml(data.message,sanitizeSettings);
        if(message.length<1) return;
        if(message.length>maxChars) return;
        // message = replaceZalgoSymbols(message);
        const messageObject = {message : message, username : socket.username, time : getTime(), id: counter++};
        provideEnoughSpaceMessagesSQL();
        addMessageSQL(messageObject);
        io.sockets.emit("new-message", messageObject);
    });

    //Delete message from SQL and sockets
    socket.on("delete-message-request",(data)=>{
        if(!checkPower(socket.username)){
            socket.emit("alert","Unauthorized access");
            return;
        }
        removeMessageById(data);
        io.sockets.emit("delete-message-confirmed", data);
    });

    //User SYSTEM sends message
    function sendSystemMessage(string) {
        const messageObject = {message : string, username : "SYSTEM", time : getTime(), id: counter++};
        addMessageSQL(messageObject);
        io.sockets.emit("new-message", messageObject);
    }

    function socketEmitInit() {
        getMessages().then(data=>{
            socket.emit("connection",data);
        });
    }

});

async function getMessages() {
    return new Promise(resolve => {
            // let sql = "SELECT * FROM Messages ORDER BY ID ASC";
            let sql = "SELECT * FROM Messages";
        mysql_connection.query(sql, function(error, result, field){
            resolve(result);
        });
    });
}
function getTime() {
    var now = new Date();
    var time = [now.getHours(), now.getMinutes(), now.getSeconds(),
        now.getDate(),now.getMonth()+1,now.getFullYear()];

    for(var i = 0; i < 5; i++) {
        if(time[i] < 10) {
            time[i] = '0' + time[i];
        }
    }


    return time[0]+":"+time[1]+":"+time[2]+" "+ time[3]+"."+ time[4]+"."+ time[5];
}

async function getPassword(user){
    return new Promise(resolve => {
        let sql = "SELECT pass FROM Users WHERE username = ?";
        let inserts = [user.username];
        sql = mysql.format(sql, inserts);
        mysql_connection.query(sql, function(error, result, field){
            resolve(result[0]);
        });
    });
}

async function addUsersSQL(user) {
    return new Promise(resolve => {
        let sql = "INSERT INTO Users VALUES(?,?)";
        let inserts = [user.username,user.password];
        sql = mysql.format(sql, inserts);
        mysql_connection.query(sql, function(error, result, field){
            resolve(result);
        });
    });
}

async function getCounter() {
    return new Promise(resolve => {
        let sql = "SELECT id FROM Messages ORDER BY ID DESC LIMIT 1";
        mysql_connection.query(sql, function(error, result, field){
            resolve(result[0]);
        });
    });
}

function addMessageSQL(messageObj) {
    let sql = "INSERT INTO Messages VALUES(?,?,?,?)";
    let inserts = [messageObj.id,messageObj.message,messageObj.username,messageObj.time];
    sql = mysql.format(sql, inserts);
    mysql_connection.query(sql);
}

function removeMessageById(id) {
    let sql = "DELETE FROM Messages WHERE id = ?;";
    let inserts = [id];
    sql = mysql.format(sql, inserts);
    mysql_connection.query(sql);
}

function provideEnoughSpaceMessagesSQL() {
    mysql_connection.query("SELECT COUNT(*) AS total FROM messages",(err,result)=>{
        console.log("Total messages: "+result[0].total);
        if(result[0].total>=maxMessages){
            mysql_connection.query("DELETE FROM messages ORDER BY id ASC limit 10");
            console.log("deleting first 10 messages in table");
        }
    });
}




function isValidUser(user) {
    if(user.username.length>15 ||user.username.length<4||
        user.password.length>15 ||user.password.length<4){
        return false;
    }
    if(!user.username.match(nickRegex)||!user.password.match(passRegex)){
        return false
    }
    return true;
}

function replaceZalgoSymbols(text) {
    return text.replace(/[^\u+0300-\u+036F]/g,"");
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
        if(username==power[i]) {
            return true;
        }
    }
    return false;
}
