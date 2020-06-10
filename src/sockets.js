const Chat = require('./models/Chat');
const Users = require('./models/Users');

module.exports = io => {

    let users = {};

    io.on('connection', async socket => {
        updateNicknames();

        let messages = await Chat.find({}).limit(50).sort('-created');

        // Add usuario a la sesion
        socket.on('new user', async(data, cb) => {
            let BDusers = await Users.find({"nick":data.nick,"pass":data.pass}).sort('name');

            console.log(BDusers);
            console.log(BDusers.length);
            if (BDusers.length == 0) {
                cb(false);
            } else {
                cb(true);
                socket.nickname = data.nick;
                users[socket.nickname] = socket;
                updateNicknames();
            }
            socket.emit('load old msgs', messages);
        });

        // Create and Add usuario a la sesion
        socket.on('create user', async(data, cb) => {
            var newUser = new Users({
                name: data.name,
                email: data.email,
                nick: data.nick,
                pass: data.pass,
                avatar: data.avatar
            });
            await newUser.save();

            console.log(data);

            socket.nickname = data.nick;
            users[socket.nickname] = socket;
            updateNicknames();
            cb(true);
            
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
                    var newMsg = new Chat({
                        msg,
                        type: 1,
                        nicksent: socket.nickname,
                        nickreceive: name
                    });
                    users[socket.nickname].emit('new message', {
                        msg,
                        type: 1,
                        nicksent: socket.nickname,
                        nickreceive: name
                    });
                    await newMsg.save();
                    if (name in users) {
                        users[name].emit('new message', {
                            msg,
                            type: 1,
                            nicksent: socket.nickname,
                            nickreceive: name
                        });
                    } else {
                    }
                } else {
                    cb('Error! Please enter your message');
                }
            } else {
                var newMsg = new Chat({
                    msg: msg,
                    type: 0,
                    nicksent: socket.nickname
                });
                await newMsg.save();

                io.sockets.emit('new message', {
                    msg,
                    type: 0,
                    nicksent: socket.nickname
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
