var rooms = [];
const roomclass = require("./room");


function joinroom(userid, isprivate, privateroomid, socket) {

    if (!isprivate) {
        //public room
        //creates a new public room if none exist
        let exist = false;
        rooms.forEach(room => {
            if (room.open && !room.privateroom) exist = true;
        })
        if (!exist) rooms.push(new roomclass.room(isprivate, undefined));

        //searches the rooms to find a suitable one
        rooms.forEach(room => {
            if (room.open && !room.privateroom) {
                room.join(userid);
            }
        })
    } else {

        //private room
        rooms.forEach(room => {
            //checks if the room exists and is open
            if (room.id == privateroomid) {
                if (room.open) {
                    room.join(userid);
                } else {
                    socket.emit('msg', "The room is already full!");
                }
            } else {
                socket.emit('msg', "No room with the provided id exist.");
            }
        })
    }
    console.log(rooms);
}

function createprivateroom(userid, socket) {
    //creates a new private room and returns its id
    let newroom = new roomclass.room(true);
    rooms.push(newroom);
    newroom.join(userid);
}

function update(roomid, data) {
    rooms.forEach(room => {
        if (room.id == roomid) room.update(data);
    })
}

function deleteroom(roomid) {
    for (let i = 0; i < rooms.length; i++) {
        if (rooms[i].id == roomid) rooms.splice(i, 1);
    }
    console.log("Deleted a room: ", roomid)
}

module.exports = {
    joinroom: joinroom,
    createprivateroom: createprivateroom,
    update: update,
    deleteroom: deleteroom,
}