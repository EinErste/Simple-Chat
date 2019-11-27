$(document).ready(function(){

    $("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);
    var socket = io();
    let power = false;
    $("#message-send").click(function(){
        socket.emit("new-message", {message : $("#message-input").val()})
        $("#message-input").val("");
    });

    socket.on("alert",(data)=>{
        alert(data);
    });

    socket.on("new-message", (data) => {
        // $("#feedback").html('');
        // $("#message-input").val('');
        renderMessage(data);
        $("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight);
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

    socket.on("delete-message-confirmed", (id)=>{
        console.log(id);
        $("#m"+id).remove();
    });
    function renderMessage(messageObj){
        $("#chatroom").append("<div class=\"message\" id=\"m"+messageObj.id+"\">\n" +
            "                <div class=\"message-info\">\n" +
            "                    <div  class=\"author\">"+messageObj.username+"</div>\n" +
            "                    <div class=\"time\">"+messageObj.time+"</div>\n" +
            "                    <button class=\"message-delete\">x</button>\n" +
            "                </div>\n" +
            "                <div class=\"text\">"+messageObj.message+"</div>\n" +
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

    $("#login").click(function(){
        socket.emit("login", {username : $("#username").val(),password: $("#password").val()})
    });

    $(document).keypress(function(e){
        if (e.which == 13){
            if($("#message-input").val()!=""){
                $("#message-send").click();
            }
        }
    });

    $(document).on("click",".message-delete",function(e){
        const messageDiv =  $(this).parent().parent();
        const messageIdString = messageDiv.attr("id");
        const messageId = messageIdString.substring(1,messageIdString.length);
        socket.emit("delete-message-request",messageId);
    });
});
