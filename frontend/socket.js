var socket = io();
var id;
var roomid;
var canvas;
var ctx;

function init() {
    var joinpublicgame = document.getElementById("joinpublicgame");
    var joinprivategame = document.getElementById("joinprivategame");
    var privateroomid = document.getElementById("privateroomid");
    var createprivategame = document.getElementById("createprivategame");
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");


    joinpublicgame.addEventListener('click', (e) => {
        e.preventDefault();
        socket.emit('joingame', { id: id, isprivate: false });
    })

    joinprivategame.addEventListener('click', (e) => {
        e.preventDefault();
        if (privateroomid.value == undefined || privateroomid.value == "" || privateroomid.value == null) {
            alert("Enter a room id!");
            return;
        }
        socket.emit('joingame', { id: id, isprivate: true, privateroomid: privateroomid.value });
    })

    createprivategame.addEventListener('click', (e) => {
        e.preventDefault();
        socket.emit('createprivateroom', { userid: id });
    })
}

socket.on('userid', args => {
    id = args;
})
socket.on('msg', args => {
    alert(args);
})
socket.on('joined', data => {
    //določi kera deksa je tvoja
    leva = data.left;
    roomid = data.roomid;
    console.log(data.roomid);
    document.getElementById("pregame").style.display = "none";
    document.getElementById("waiting").style.display = "block";
    if (data.private && data.players == 0) window.prompt("You joined a private room! Its id: ", data.roomid);
})
socket.on('start', () => {
    document.getElementById("waiting").style.display = "none";
    document.getElementById("game").style.display = "block";
    start();
})