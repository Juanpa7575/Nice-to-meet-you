
Notification.requestPermission();

//variables
let $username;
let unfocus = false;

$(function () {

    // socket.io cliente
    const socket = io.connect();

    // Obtenemos los elementos de la interfaz de mensajes
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#messages');

    // Obtenemos los elementos del inicio de sesion
    const $nickForm = $('#nickForm');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');

    // Obtenemos la ubicacion para los nombres de usaurio
    const $users = $('#usernames');

    //inicio de sesion en Sockets
    $nickForm.submit(e => {
      e.preventDefault();
      socket.emit('new user', $nickname.val(), data => {
        if(data) {
          $username = $nickname.val();
          $('#nickWrap').hide();
          $('#frame').show();
          $('#message').focus();
         
        } else {
          $nickError.html(`
            <div class="alert alert-danger">
              That username already Exists.
            </div>
          `);
        }
      });
    });

    //Eventos
    $messageForm.submit( e => {
        e.preventDefault();
        if($messageBox.val() != ""){
        socket.emit('send message', $messageBox.val(), $username, data => {
          $chat.append(`<p class="error">${data}</p>`)
        });
      }
        $messageBox.val('');
    });

    //escucahr un nuevo mensaje
    socket.on('new message', data => {
        displayMsg(data);
        notificacion(data);
        $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
    });

    //Listar usuarios activos
    socket.on('usernames', data => {
      let html = '';
      for(i = 0; i < data.length; i++) {

        if(data[i] == $nickname){
            console.log("ya?");
            
        }else{
            html += `
            <li class="contact">
                <div class="wrap">
                    <span class="contact-status online"></span>
                    <img src="./img/alt-user/${data[i].charAt(0).toUpperCase()}.png" alt="" />
                    <div class="meta">
                        <p class="name">${data[i]}</p>
                        <p class="preview">Chat with me!!</p>
                    </div>
                </div>
            </li>
            `; 
        }
        
      }
      $users.html(html);
    });
    
    socket.on('whisper', data => {
      $chat.append(`
      <li class="contact">
            <div class="wrap">
                <span class="contact-status online"></span>
                <img src="./img/alt-user/${data[i].charAt(0).toUpperCase()}.png" alt="" />
                <div class="meta">
                    <p class="name whisper">${data[i]}</p>
                    <p class="preview">Chat with me!!</p>
                </div>
            </div>
        </li>
        `);
    });

    socket.on('load old msgs', msgs => {
      for(let i = msgs.length -1; i >=0 ; i--) {
        displayMsg(msgs[i]);
      }
      $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
    });

    function displayMsg(data) {
        if(data.nick == $nickname.val()){
            $chat.append(`
                <ul>
                    <li class="replies">
                        <img src="./img/alt-user/${data.nick.charAt(0).toUpperCase()}.png" alt="" />
                        <p>${data.nick} : ${data.msg}</p>
                    </li>
                </ul>`
            );
        }else{
            $chat.append(`
                <ul>
                    <li class="sent">
                        <img src="./img/alt-user/${data.nick.charAt(0).toUpperCase()}.png" alt="" />
                        <p>${data.nick} : ${data.msg}</p>
                    </li>
                </ul>`
            );
        }
       
    }

    //Comprobar si la ventana se encuentra activa
    document.addEventListener('visibilitychange', function(){
        unfocus = document.hidden;
        //reacctivar sesion
        if(unfocus == true){
            socket.emit('reconnect', $username, data => {
                
            });
        }
    })

    function notificacion(data){

        if(unfocus == true){

            var title = data.nick
            var extra = {
    
            icon: "http://xitrus.es/imgs/logo_claro.png",
            body: data.msg
    
            }
            new Notification( title, extra)

        }
    
    }

});

//Script de apariencia
$("#profile-img").click(function () {
    $("#status-options").toggleClass("active");
});

$(".expand-button").click(function () {
    $("#profile").toggleClass("expanded");
    $("#contacts").toggleClass("expanded");
});

$("#status-options ul li").click(function () {
    $("#profile-img").removeClass();
    $("#status-online").removeClass("active");
    $("#status-away").removeClass("active");
    $("#status-busy").removeClass("active");
    $("#status-offline").removeClass("active");
    $(this).addClass("active");

    if ($("#status-online").hasClass("active")) {
        $("#profile-img").addClass("online");
    } else if ($("#status-away").hasClass("active")) {
        $("#profile-img").addClass("away");
    } else if ($("#status-busy").hasClass("active")) {
        $("#profile-img").addClass("busy");
    } else if ($("#status-offline").hasClass("active")) {
        $("#profile-img").addClass("offline");
    } else {
        $("#profile-img").removeClass();
    };

    $("#status-options").removeClass("active");
});