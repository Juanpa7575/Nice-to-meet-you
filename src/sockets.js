const Chat = require('./models/Chat');

module.exports = io => {

    let users = {};

    io.on('connection', async socket => {
        updateNicknames();

        let messages = await Chat.find({}).limit(10).sort('-created');

        // Add usuario a la sesion
        socket.on('new user', (data, cb) => {
            if (data in users) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = data;
                users[socket.nickname] = socket;
                updateNicknames();
            }
            socket.emit('load old msgs', messages);
        });

        //reactive session
        socket.on('reconnect', async(user, cb)  => {
            console.log(user);
            if(socket.nickname === undefined){
                console.log(user);
                socket.nickname = user;
                users[socket.nickname] = socket;
                updateNicknames();
                cb(true);
            }else{
                cb(false);
            }
        });

        // receive a message
        socket.on('send message', async (data, user, cb) => {
            var msg = data.trim();

            if(socket.nickname === undefined){
                socket.nickname = user;
                users[socket.nickname] = socket;
                updateNicknames();
            }

            if (msg.substr(0, 3) === '/w ') {
                msg = msg.substr(3);
                var index = msg.indexOf(' ');
                if (index !== -1) {
                    var name = msg.substring(0, index);
                    console.log(name);
                    var msg = msg.substring(index + 1);
                    if (name in users) {
                        users[name].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                        users[socket.nickname].emit('whisper', {
                            msg,
                            nick: socket.nickname
                        });
                    } else {
                        cb('Error! Enter a valid User');
                    }
                } else {
                    cb('Error! Please enter your message');
                }
            } else {
                var newMsg = new Chat({
                    msg,
                    nick: socket.nickname
                });
                await newMsg.save();

                io.sockets.emit('new message', {
                    msg,
                    nick: socket.nickname
                });
            }
        });

        socket.on('disconnect', data => {
            if (!socket.nickname) return;
            delete users[socket.nickname];
            updateNicknames();
        });

        function updateNicknames() {
            io.sockets.emit('usernames', Object.keys(users));
        }
    });

}
