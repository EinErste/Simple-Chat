!function(e){var n={};function t(s){if(n[s])return n[s].exports;var o=n[s]={i:s,l:!1,exports:{}};return e[s].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=n,t.d=function(e,n,s){t.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:s})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,n){if(1&n&&(e=t(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var s=Object.create(null);if(t.r(s),Object.defineProperty(s,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var o in e)t.d(s,o,function(n){return e[n]}.bind(null,o));return s},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},t.p="",t(t.s=0)}([function(e,n){$(document).ready((function(){var e=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;$("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);var n=io(),t=!1;function s(n){$("#chatroom").append('<div class="message" id="m'+n.id+'">\n                <div class="message-info">\n                    <div class="author">'+n.username+'</div>\n                    <div class="time">'+n.time+'</div>\n                    <button class="message-delete">x</button>\n                </div>\n                <div class="text">'+n.message.replace(e,(function(e){return'<a href="'+e+'">'+e+"</a>"}))+"</div>\n            </div>");var s=n.message.substring(n.message.length-9,n.message.length-5);"SYSTEM"==n.username&&("left"==s?$("#m"+n.id).css("background-color","lavender"):$("#m"+n.id).css("background-color","darkseagreen")),t?$(".message-delete").css("display","block"):$(".message-delete").css("display","none")}$(".message-send").click((function(){var e;n.emit("new-message",{message:(e=$(".message-input").val(),e.replace(/(?:\r\n|\r|\n)/g,"<br>"))}),$(".message-input").val("")})),n.on("alert",(function(e){alert(e)})),n.on("new-message",(function(e){s(e),$("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight)})),n.on("online-counter",(function(e){$(".online-users").text("Users online: "+e)})),n.on("connection",(function(e){for(var n=0;n<e.length;n++)s(e[n]);$("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight)})),n.on("power",(function(e){(t=e)?$(".message-delete").css("display","block"):$(".message-delete").css("display","none")})),n.on("change-username",(function(e){"#"+("000000"+Math.random().toString(16).slice(2,8).toUpperCase()).slice(-6),$("#user").text("User: "+e)})),n.on("delete-message-confirmed",(function(e){$("#m"+e).remove()})),$(".login").click((function(){n.emit("login",{username:$(".username").val(),password:$(".password").val()}),$(".username").val(""),$(".password").val("")})),$(document).on("click",".message-delete",(function(e){var t=$(this).parent().parent().attr("id"),s=t.substring(1,t.length);n.emit("delete-message-request",s)})),$(".message-input").keypress((function(e){if(13==e.keyCode&&!e.shiftKey)return $(".message-send").click(),!1}))}))}]);