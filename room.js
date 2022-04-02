var io;
class room {
    players = [];
    playercount = 0;
    open = true;

    constructor(privateroom) {
        this.privateroom = privateroom;
        this.id = Date.now();
        console.log("Created a new room: ", this);
    }

    join(userid) {
        this.players.push(userid);
        //levo/desno
        if (this.playercount == 0) emit([userid], 'joined', { left: true, roomid: this.id, private: this.privateroom, players: this.playercount });
        if (this.playercount == 1) emit([userid], 'joined', { left: false, roomid: this.id, private: this.privateroom, players: this.playercount });

        this.playercount++;
        if (this.playercount == 2) this.start();
    }

    start() {
        this.open = false;
        emit(this.players, 'start', true);
    }

    update(data) {
        this.players.forEach(player => {
            if (player != data.playerid) {
                //mogoče dodaj procesiranje za žogico, desko pošlji takoj
                emit([player], 'update', { deska: data.deska, zoga: data.zoga });
            }
        })
    }
}

function init(io2) {
    io = io2;
}

function emit(who, title, message) {
    who.forEach(el => {
        io.to(el).emit(title, message);
    });
}


module.exports = {
    room: room,
    init: init,
}