!function(e){var n={};function t(o){if(n[o])return n[o].exports;var s=n[o]={i:o,l:!1,exports:{}};return e[o].call(s.exports,s,s.exports,t),s.l=!0,s.exports}t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:o})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var o=Object.create(null);if(t.r(o),Object.defineProperty(o,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var s in e)t.d(o,s,function(n){return e[n]}.bind(null,s));return o},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n){$(document).ready((function(){var e="Anonymous";$("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);var n=io(),t=!1,o=!0;function s(n){($("#chatroom").append('<div class="message" id="m'+n.id+'">\n                <div class="message-info">\n                    <div class="message-info-inwrapper"><div class="author">'+n.username+'</div>\n                    <div class="time">'+n.time+'</div></div>\n                    <button class="message-delete">x</button>\n                </div>\n                <div class="text">'+function(n){var t=n.replace("@everyone",(function(e){return'<span style="color: red;">'+e+"</span>"}));return"Anonymous"==e?t:t=t.replace("@"+e,(function(e){return'<span style="color: darkorange;">'+e+"</span>"}))}(n.message.replace(/image\((.*)\)/,(function(e){return'<img class="message-img" src="'+e.match(/image\((.*)\)/)[1]+'">'})))+"</div>\n            </div>"),"SYSTEM"==n.username)&&("left"==n.message.substring(n.message.length-9,n.message.length-5)?$("#m"+n.id).css("background-color","lavender"):$("#m"+n.id).css("background-color","lightyellow"));t?$(".message-delete").css("display","block"):$(".message-delete").css("display","none")}$(".message-send").click((function(){var t;(o||"Admin"==e||"Moderator"==e)&&(o=!1,setTimeout((function(){o=!0}),1500),n.emit("new-message",{message:(t=$(".message-input").val(),t.replace(/(?:\r\n|\r|\n)/g,"<br>"))}),$(".message-input").val(""))})),n.on("alert",(function(e){alert(e)})),n.on("new-message",(function(n){(s(n),n.message.includes("@everyone")||n.message.includes("@"+e))&&new Audio("../media/sounds/notification.mp3").play();setInterval((function(){$("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight)}),100),"Anonymous"!=e&&$(".author").filter((function(){return $(this).text()==e})).css("color","darkorange")})),n.on("online-counter",(function(e){$(".online-users").text("Users online: "+e)})),n.on("connection",(function(e){$(".message").remove();for(var n=0;n<e.length;n++)s(e[n]);setInterval((function(){$("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight)}),500)})),n.on("power",(function(e){(t=e)?$(".message-delete").css("display","block"):$(".message-delete").css("display","none")})),n.on("change-username",(function(n){e=n;var t="@"+n;$(".message .text:contains("+t+")").html((function(e,n){return n.split(t).join('<span style="color: darkblue;">'+t+"</span>")})),$(".author").css("color","black"),$(".author").filter((function(){return $(this).text()==e})).css("color","darkorange"),$("#user").css("color","darkorange"),$("#user").text(""+n)})),n.on("delete-message-confirmed",(function(e){$("#m"+e).remove()})),$(".login").click((function(){n.emit("login",{username:$(".username").val(),password:$(".password").val()}),$(".username").val(""),$(".password").val("")})),$(document).on("click",".message-delete",(function(e){var t=$(this).parent().parent().attr("id"),o=t.substring(1,t.length);n.emit("delete-message-request",o)})),$(".message-input").keypress((function(e){if(13==e.keyCode&&!e.shiftKey)return $(".message-send").click(),!1}))}))}]);