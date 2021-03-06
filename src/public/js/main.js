
Notification.requestPermission();
$('<audio id="chatAudio"><source src="./audio/notify.ogg" type="audio/ogg"><source src="./audio/notify.mp3" type="audio/mpeg"><source src="./audio/notify.wav" type="audio/wav"></audio>').appendTo('body');

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
    const $pass = $('#pass');

    //Obtenemos los elementos para registrar un nuevo usuario
    const $nickRegisterForm = $('#nickRegisterForm');
    const $nickError2 = $('#nickError2');
    const $newname = $('#newname')
    const $newemail = $('#newemail')
    const $newnickname = $('#newnickname')
    const $newpass = $('#newpass')
    const $newpass2 = $('#newpass2')

    // Obtenemos los elementos de la informacion del usuario
    const $nickuser = $('#profile-name');
    const $imguser = $('#profile-img');
    //const $nickname = $('#nickname');

    // Obtenemos la ubicacion para los nombres de usaurio
    const $users = $('#usernames');

    //inicio de sesion en Sockets
    $nickForm.submit(e => {
        e.preventDefault();
        const $userinfo = {
            nick: $nickname.val(),
            pass: $pass.val(),
        }
        socket.emit('new user', $userinfo, data => {
            if (data) {
                $username = $nickname.val();
                $('#nickWrap').hide();
                $('#frame').show();
                $('#message').focus();
                $nickuser.text($username);
                $imguser.attr("src", "./img/alt-user/" + $username.charAt(0).toUpperCase() + ".png");
                progressbar();
            } else {
                $nickError.html(`
                <div class="alert alert-danger">
                The user or pass are wrong.
                </div>
                `);
            }
        });
    });

    //Registrar nuevo usuario e iniciar chat
    $nickRegisterForm.submit(e => {
        e.preventDefault();

        if ($newpass.val() == $newpass2.val()){
            const $userinfo = {
                name: $newname.val(),
                email: $newemail.val(),
                nick: $newnickname.val(),
                pass: $newpass.val(),
                avatar: $newnickname.val().charAt(0).toUpperCase()
            }
    
            socket.emit('create user', $userinfo, data => {
                if (data) {
                    $username = $newnickname.val();
                    $('#nickWrap').hide();
                    $('#frame').show();
                    $('#message').focus();
                    $nickuser.text($username);
                    $imguser.attr("src", "./img/alt-user/" + $userinfo.avatar + ".png");
                    progressbar();
                } else {
                    $nickError2.html(`
                    <div class="alert alert-danger">
                        That username already Exists.
                    </div>
                    `);
                }
            });
        }else{
            $nickError2.html(`
            <div class="alert alert-danger">
                That username already Exists.
            </div>
            `);
        }
    });

    //------------------------------------------------Eventos----------------------------------------------------
    //Enviar mensajes
    $messageForm.submit(e => {
        e.preventDefault();
        if ($messageBox.val() != "") {
            socket.emit('send message', $messageBox.val(), $username, data => {
                $chat.append(`<p class="error">${data}</p>`)
            });
        }
        $messageBox.val('');
    });

    //Comprobar si la ventana se encuentra activa
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            console.log('bye');
        } else {
            console.log('well back');
            socket.emit('reconnect', $username, data => {
                $chat.append(`<p class="error">${data}</p>`)
            });
        }
        unfocus = document.hidden;
    })

    //-------------------------------------------------------------------------------------------------------------
    //escucahr un nuevo mensaje
    socket.on('new message', data => {
        notificacion(data);
        displayMsg(data);
        $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight") }, 1000);
    });

    //Listar usuarios activos
    socket.on('usernames', data => {
        let html = '';
        for (i = 0; i < data.length; i++) {
            if (data[i] == $username) {
            } else {
                html += `
                <div onclick="privateChat('${data[i]}')" id="${data[i]}">
                    <li class="contact">
                        <div class="wrap">
                            <span class="contact-status online"></span>
                            <img src="./img/alt-user/${data[i].charAt(0).toUpperCase()}.png" alt="" />
                            <div class="meta">
                                <p class="name">${data[i]}</p>
                                <p classprivateChat="preview">Click to sent a private message!!</p>
                            </div>
                        </div>
                    </li>
                </div>
            `;
            }

        }
        $users.html(html);
    });

    //Cargar mensajes antiguos
    socket.on('load old msgs', msgs => {
        for (let i = msgs.length - 1; i >= 0; i--) {
            displayMsg(msgs[i]);
        }
        $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight") }, 1000);
    });

    //--------------------------------------------------------------------------------------------------------------
    //Mostrar mensajes
    function displayMsg(data) {

        if (data.type == 0){
            $chatmessage = '<strong id="pname">'+data.nicksent+" : </strong>"+data.msg;
            if (data.nicksent == $username) {
                $classchatMessage = "replies";            
            } else {
                $classchatMessage = "sent"; 
            }
            $chat.append(`
                <ul>
                    <li class="${$classchatMessage}">
                        <img src="./img/alt-user/${data.nicksent.charAt(0).toUpperCase()}.png" alt="" />
                        <p>${$chatmessage}</p>
                    </li>
                </ul>`
            );
        }

        if (data.type == 1){

            if (data.nicksent == $username){
                $classchatMessage = "whisper-replies"; 
                $chatmessage = '<ins id="pname">Private to '+data.nickreceive+"</ins> : "+data.msg;
                $chat.append(`
                <ul>
                    <li class="${$classchatMessage}">
                        <img src="./img/alt-user/${data.nicksent.charAt(0).toUpperCase()}.png" alt="" />
                        <p>${$chatmessage}</p>
                    </li>
                </ul>`
            );
            } else if (data.nickreceive == $username){
                $classchatMessage = "whisper-sent"; 
                $chatmessage = '<ins id="pname">Private from '+data.nicksent+"</ins> : "+data.msg;
                $chat.append(`
                <ul>
                    <li class="${$classchatMessage}">
                        <img src="./img/alt-user/${data.nicksent.charAt(0).toUpperCase()}.png" alt="" />
                        <p>${$chatmessage}</p>
                    </li>
                </ul>`
            );
            }
            
        }
        
    }

    //Si la ventana esat inectiva ejecutar notificacions
    function notificacion(data) {
        if (unfocus == true) {
            $('#chatAudio')[0].play();
            var title = data.nicksent
            var extra = {
                icon: "https://stackoverrun.com/src/images/fivicon.png",
                body: data.msg
            }
            var noti = new Notification(title, extra)
            setTimeout(function () { noti.close() }, 5000)
        }
    }

});

//----------------------------------------------Script de apariencia--------------------------------------------------

//Barra prograsiva
function progressbar() {
    var current_progress = 0;
    var interval = setInterval(function () {
        current_progress += 10;
        $("#dynamic")
            .css("width", current_progress + "%")
            .attr("aria-valuenow", current_progress)
            .text(current_progress + "%");
        if (current_progress >= 100)
            clearInterval(interval);
    }
        , 1000);
};

//chat privado
function privateChat(id){
    console.log(id);
    $('#message').val("");
    $('#message').val("/w "+id+" ");
    $('#message').focus();

}

//Mostrar ocultar signUp y signDown
$("#signInToggle").click(function (event) {
    $("#signUp").slideToggle();
    $("#signIn").slideToggle();
});
$("#signUpToggle").click(function (event) {
    $("#signUp").slideToggle();
    $("#signIn").slideToggle();
});

//Diseño de menus
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