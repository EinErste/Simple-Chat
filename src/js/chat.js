$(document).ready(function(){
    const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    $("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);
    let color;
    var socket = io();
    let power = false;
    $(".message-send").click(function(){
        socket.emit("new-message", {message : insert_br($(".message-input").val())})
        $(".message-input").val("");
    });

    socket.on("alert",(data)=>{
        alert(data);
    });

    socket.on("new-message", (data) => {
        renderMessage(data);
        $("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight);
    });
    socket.on("online-counter",counter=>{
        $(".online-users").text("Users online: "+counter);
    });
    socket.on("connection",(data)=>{
        for (let i = 0; i < data.length; i++) {
            renderMessage(data[i]);
        }
        $("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight);
    });

    socket.on("power",data=> {
        power = data;
        if(power){
            $(".message-delete").css("display","block");
        } else {
            $(".message-delete").css("display","none");
        }
    });

    socket.on("change-username",name=>{
        color = "#" + ("000000" + Math.random().toString(16).slice(2, 8).toUpperCase()).slice(-6);
        //$(".author").css("color",color);
        $("#user").text("User: "+name);
    });

    socket.on("delete-message-confirmed", (id)=>{
        $("#m"+id).remove();
    });
    function renderMessage(messageObj){
        $("#chatroom").append("<div class=\"message\" id=\"m"+messageObj.id+"\">\n" +
            "                <div class=\"message-info\">\n" +
            "                    <div class=\"author\">"+messageObj.username+"</div>\n" +
            "                    <div class=\"time\">"+messageObj.time+"</div>\n" +
            "                    <button class=\"message-delete\">x</button>\n" +
            "                </div>\n" +
            "                <div class=\"text\">"+linkify(messageObj.message)+"</div>\n" +
            "            </div>");
        const user_left = messageObj.message.substring(messageObj.message.length-9,messageObj.message.length-5);
        if(messageObj.username=="SYSTEM"){
            if(user_left=="left"){
                $("#m"+messageObj.id).css("background-color","lavender");
            } else {
                $("#m"+messageObj.id).css("background-color","darkseagreen");
            }
        }
        if(power){
            $(".message-delete").css("display","block");
        } else {
            $(".message-delete").css("display","none");
        }
    }

    $(".login").click(function(){
        socket.emit("login", {username : $(".username").val(),password: $(".password").val()})
        $(".username").val("");
        $(".password").val("");
    });

    $(document).on("click",".message-delete",function(e){
        const messageDiv =  $(this).parent().parent();
        const messageIdString = messageDiv.attr("id");
        const messageId = messageIdString.substring(1,messageIdString.length);
        socket.emit("delete-message-request",messageId);
    });

    function insert_br(text) {
        return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
    }

    function linkify(text) {
        return text.replace(urlRegex, function(url) {
            return '<a href="' + url + '">' + url + '</a>';
        });
    }

    $(".message-input").keypress(function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            $(".message-send").click();
            return false;
        }
    });

});