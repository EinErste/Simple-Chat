!function(e){var n={};function o(t){if(n[t])return n[t].exports;var s=n[t]={i:t,l:!1,exports:{}};return e[t].call(s.exports,s,s.exports,o),s.l=!0,s.exports}o.m=e,o.c=n,o.d=function(e,n,t){o.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:t})},o.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},o.t=function(e,n){if(1&n&&(e=o(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var t=Object.create(null);if(o.r(t),Object.defineProperty(t,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var s in e)o.d(t,s,function(n){return e[n]}.bind(null,s));return t},o.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return o.d(n,"a",n),n},o.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},o.p="",o(o.s=0)}([function(e,n){$(document).ready((function(){var e="Anonymous";$("#chatroom").scrollTop($("#chatroom")[0].scrollHeight);var n,o=io(),t=!1,s=!0,r=!0;function i(n){($("#chatroom").append('<div class="message" id="m'+n.id+'">\n                <div class="message-info">\n                    <div class="message-info-inwrapper"><div class="author">'+n.username+'</div>\n                    <div class="time">'+n.time+'</div></div>\n                    <button class="message-delete">x</button>\n                </div>\n                <div class="text">'+function(n){var o=n.replace("@everyone",(function(e){return'<span style="color: red;">'+e+"</span>"}));return"Anonymous"==e?o:o=o.replace("@"+e,(function(e){return'<span style="color: darkorange;">'+e+"</span>"}))}(function(e){return e.replace(/url\((.*)\)/,(function(e){var n=e.match(/url\((.*)\)/)[1];return'<a target="_blank" href="'+n+'">'+n+"</a>"}))}(n.message.replace(/image\((.*)\)/,(function(e){return'<br><img class="message-img" src="'+e.match(/image\((.*)\)/)[1]+'"><br>'}))))+"</div>\n            </div>"),"SYSTEM"==n.username)&&("left"==n.message.substring(n.message.length-9,n.message.length-5)?$("#m"+n.id).css("background-color","lavender"):$("#m"+n.id).css("background-color","lightyellow"));t?$(".message-delete").css("display","block"):$(".message-delete").css("display","none")}$("html, body, #content-container").css({height:$(window).height()}),$(".message-send").click((function(){var n;(s||"Admin"==e||"Moderator"==e)&&(s=!1,setTimeout((function(){s=!0}),1500),o.emit("new-message",{message:(n=$(".message-input").val(),n.replace(/(?:\r\n|\r|\n)/g,"<br>"))}),$(".message-input").val(""))})),$(window).blur((function(){n=window.setTimeout((function(){o.emit("idle")}),36e5)})),$(window).focus((function(){o.connected||location.reload(),clearTimeout(n)})),$(".hide-login").click((function(){r?($(".title").css("display","none"),$("#login-form").css("display","none"),$("#title-info").css("display","none"),$(".faq").css("display","none"),r=!1):($(".title").css("display","block"),$("#login-form").css("display","flex"),$("#title-info").css("display","flex"),$(".faq").css("display","initial"),r=!0)})),o.on("alert",(function(e){alert(e)})),o.on("new-message",(function(n){(i(n),n.message.includes("@everyone")||n.message.includes("@"+e))&&new Audio("../media/sounds/notification.mp3").play();setTimeout((function(){$("#chatroom").scrollTop($("#chatroom").get(0).scrollHeight)}),100),"Anonymous"!=e&&$(".author").filter((function(){return $(this).text()==e})).css("color","darkorange")})),o.on("online-counter",(function(e){$(".online-users").text("Users online: "+e)})),o.on("connection",(function(e){$(".message").remove();for(var n=0;n<e.length;n++)i(e[n]);$(window).width()<901&&$(".hide-login").click(),setTimeout((function(){$("#chatroom").animate({scrollTop:$("#chatroom").get(0).scrollHeight},500)}),500)})),o.on("connect_error",(function(e){o.io.reconnection(!1)})),o.on("power",(function(e){(t=e)?$(".message-delete").css("display","block"):$(".message-delete").css("display","none")})),o.on("change-username",(function(n){e=n;var o="@"+n;$(".message .text:contains("+o+")").html((function(e,n){return n.split(o).join('<span style="color: darkblue;">'+o+"</span>")})),$(".author").css("color","black"),$(".author").filter((function(){return $(this).text()==e})).css("color","darkorange"),$("#user").html('Account<br><span style="color: darkorange;">'+n+"</span>")})),o.on("delete-message-confirmed",(function(e){$("#m"+e).remove()})),$(".login").click((function(){o.emit("login",{username:$(".username").val(),password:$(".password").val()}),$(".username").val(""),$(".password").val("")})),$(document).on("click",".message-delete",(function(e){var n=$(this).parent().parent().attr("id"),t=n.substring(1,n.length);o.emit("delete-message-request",t)})),$(".message-input").keypress((function(e){if(13==e.keyCode&&!e.shiftKey)return $(".message-send").click(),!1}))}))}]);