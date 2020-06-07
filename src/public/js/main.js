$(function () {

    // socket.io client side connection
    const socket = io.connect();

    // obtaining DOM elements from the Chat Interface
    const $messageForm = $('#message-form');
    const $messageBox = $('#message');
    const $chat = $('#messages');

    // obtaining DOM elements from the NicknameForm Interface
    const $nickForm = $('#nickForm');
    const $nickError = $('#nickError');
    const $nickname = $('#nickname');

    // obtaining the usernames container DOM
    const $users = $('#usernames');

    $nickForm.submit(e => {
      e.preventDefault();
      socket.emit('new user', $nickname.val(), data => {
        if(data) {
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

    // events
    $messageForm.submit( e => {
      e.preventDefault();
      socket.emit('send message', $messageBox.val(), data => {
        $chat.append(`<p class="error">${data}</p>`)
      });
      $messageBox.val('');
    });

    socket.on('new message', data => {
      if(data.msg != ""){
        displayMsg(data);
        $("#messages").animate({ scrollTop: $('#messages').prop("scrollHeight")}, 1000);
      }
    });

    socket.on('usernames', data => {
      let html = '';
      for(i = 0; i < data.length; i++) {
        html += `<p><i class="fas fa-user"></i> ${data[i]}</p>`; 
      }
      $users.html(html);
    });
    
    socket.on('whisper', data => {
      $chat.append(`<p class="whisper"><b>${data.nick}</b>: ${data.msg}</p>`);
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
                        <img src="http://emilcarlsson.se/assets/mikeross.png" alt="" />
                        <p>${data.nick} : ${data.msg}</p>
                    </li>
                </ul>`
            );
        }else{
            $chat.append(`
                <ul>
                    <li class="sent">
                        <img src="http://emilcarlsson.se/assets/harveyspecter.png" alt="" />
                        <p>${data.nick} : ${data.msg}</p>
                    </li>
                </ul>`
            );
        }
       
    }
});


$("#messages").animate({ scrollTop: $(document).height() }, "fast");

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

/*
function newMessage() {

    message = $(".message-input input").val();

    if ($.trim(message) == '') {
        return false;
    }

    $('<li class="sent"><img src="http://emilcarlsson.se/assets/mikeross.png" alt="" /><p>' + message + '</p></li>').appendTo($('#messages ul'));
    $('.message-input input').val(null);
    $('.contact.active .preview').html('<span>You: </span>' + message);
    $('#messages').animate({ scrollTop: docHeight + 93 }, "fast");
    $('#messages').animate({ scrollTop: $('#panelChat')[0].scrollHeight }, 1000);

    docHeight += 93;

}
$('.submit').click(function () {
    newMessage();
});

$(window).on('keydown', function (e) {
    if (e.which == 13) {
        newMessage();
        return false;
    }
});
//# sourceURL=pen.js */