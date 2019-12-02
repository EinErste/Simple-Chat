$(document).ready(function(){
    const urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
    let username = "Anonymous";
    $("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);
    var socket = io();
    let power = false;
    let canSend = true;
    let hideInfo = true;
    let idle = false;
    //Idle time 5 mins
    const idleTime = 5 * 60000;
    //Forbid to hide bar on mobile
    $("html, body, #content-container").css({
        height: $(window).height()
    });

    $(".message-send").click(function(){
        if(!canSend && (username!="Admin"&&username!="Moderator")) return;
        canSend = false;
        setTimeout(function() {
            canSend = true;
        }, 1500);
        socket.emit("new-message", {message : insert_br($(".message-input").val())})
        $(".message-input").val("");
    });

    //Idle connection handling
    $(window).blur(function(){
        idle = true;
        setTimeout(() => {
            if(idle) socket.emit("idle");
        }, idleTime);
    });
    $(window).focus(function(){
        if(!socket.connected){
            location.reload();
        }
        idle = false;
    });

    $(".hide-login").click(function () {
        if(hideInfo){
            $(".title").css("display","none");
            $("#login-form").css("display","none");
            $("#title-info").css("display","none");
            $(".faq").css("display","none");
            hideInfo =false;
        } else {
            $(".title").css("display","block");
            $("#login-form").css("display","flex");
            $("#title-info").css("display","flex");
            $(".faq").css("display","initial");
            hideInfo = true;
        }
    });
    socket.on("alert",(data)=>{
        alert(data);
    });

    socket.on("new-message", (data) => {
        renderMessage(data);
        if(data.message.includes("@everyone")|| (data.message.includes("@"+username))){
            let audio = new Audio('../media/sounds/notification.mp3');
            audio.play();
        }
        setTimeout(() => {
            $("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight);
        }, 100);
        if(username=="Anonymous") return;
        $(".author").filter(function () {
            return $(this).text() == username;
        }).css("color", "darkorange");
    });
    socket.on("online-counter",counter=>{
        $(".online-users").text("Users online: "+counter);
    });
    socket.on("connection",(data)=>{
        $(".message").remove();
        for (let i = 0; i < data.length; i++) {
            renderMessage(data[i]);
        }
        if($(window).width()<901){
            $(".hide-login").click();
        }
        setTimeout(() => {
            $("#chatroom").animate({ scrollTop: $("#chatroom").get(0).scrollHeight }, 500);
        }, 500);
    });

    //Dunno if working
    socket.on("connect_error", function(e) {
        socket.io.reconnection(false);
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
        username = name;
        const u = "@"+name;
        //Color this user tags
        $(".message .text:contains("+u+")").html(function(_, html) {
            return html.split(u).join("<span style=\"color: darkblue;\">"+u+"</span>");
        });
        //Set usernames color to default
        $(".author").css("color","black");
        //Set this username color to darkorange
        $(".author").filter(function () {
            return $(this).text() == username;
        }).css("color", "darkorange");;
        $("#user").html("Account<br><span style=\"color: darkorange;\">"+name+"</span>");
    });

    socket.on("delete-message-confirmed", (id)=>{
        $("#m"+id).remove();
    });
    function renderMessage(messageObj){
        $("#chatroom").append("<div class=\"message\" id=\"m"+messageObj.id+"\">\n" +
            "                <div class=\"message-info\">\n" +
            "                    <div class=\"message-info-inwrapper\"><div class=\"author\">"+messageObj.username+"</div>\n" +
            "                    <div class=\"time\">"+messageObj.time+"</div></div>\n" +
            "                    <button class=\"message-delete\">x</button>\n" +
            "                </div>\n" +
            "                <div class=\"text\">"+tagUser(linkify(imagefy(messageObj.message)))+"</div>\n" +
            "            </div>");

        if(messageObj.username=="SYSTEM"){
            const user_left = messageObj.message.substring(messageObj.message.length-9,messageObj.message.length-5);
            if(user_left=="left"){
                $("#m"+messageObj.id).css("background-color","lavender");
            } else {
                $("#m"+messageObj.id).css("background-color","lightyellow");
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
        return text.replace(/url\((.*)\)/, function(url) {
            const str = url.match(/url\((.*)\)/)[1];
            return '<a target="_blank" href="' + str + '">' + str + '</a>';
        });
    }

    function imagefy(text) {
        return text.replace(/image\((.*)\)/, function(img) {
            const str = img.match(/image\((.*)\)/)[1];
            return '<br><img class="message-img" src="' + str + '"><br>';
        });
    }

    function tagUser(text){
        let result = text.replace("@everyone",function (replace) {
            return "<span style=\"color: red;\">"+replace+"</span>";
        });
        if(username=="Anonymous") return result;
        result = result.replace("@"+username,function (replace) {
            return "<span style=\"color: darkorange;\">"+replace+"</span>";
        });
        return result;
    }

    $(".message-input").keypress(function(event) {
        if (event.keyCode == 13 && !event.shiftKey) {
            $(".message-send").click();
            return false;
        }
    });

});
