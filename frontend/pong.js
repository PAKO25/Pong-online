var objects = [];
var gameinterval;
var relx;
var rely;
var mojadeska;
var mojazoga;
var drugadeska;
var leva;
var serverupdateinterval;
var gameover = false;


class deska {
    color = "#0000FF";
    constructor(leva) {
        this.width = canvas.width / 40;
        this.height = canvas.height / 3;
        this.y = (canvas.height / 2) - (this.height / 2);
        if (leva) {
            this.x = canvas.width / 20;
        } else {
            this.x = canvas.width - (canvas.width / 20) - this.width;
        }
        this.dy = 0;
        this.dx = 0;
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    update() {
        if ((this.y + this.dy > 0) && (this.y + this.height + this.dy < canvas.height)) this.y += this.dy;
    }
    getRelativeXY() {
        let x = this.x / relx;
        let y = this.y / rely;
        let dx = this.dx / relx;
        let dy = this.dy / rely;
        return { x: x, y: y, dx: dx, dy: dy };
    }
    setRelativeXY(x, y, dx, dy) {
        //popravi
        if (x != undefined) this.x = x * relx;
        if (y != undefined) this.y = y * rely;
        if (dx != undefined) this.dx = dx * relx;
        if (dy != undefined) this.dy = dy * rely;
    }
}

class zoga extends deska {
    color = "#FF0000";
    cancollide = true;
    constructor() {
        super();
        this.width = canvas.width / 30;
        this.height = this.width;
        this.x = (canvas.width / 2) - (this.width / 2);
        this.y = (canvas.height / 2) - (this.height / 2);
        this.dx = relx * 1.5;
        this.dy = rely;
    }
    update() {
        this.x += this.dx;
        this.y += this.dy;
        if (this.y < 0 || this.y > canvas.height - this.height) this.dy = -this.dy;
        if (this.x < 0) die("Right");
        if (this.x > canvas.width - this.width) die("Left");
        objects.forEach(obj => {
            if (obj.x == this.x) return;
            if (this.x < obj.x + obj.width &&
                this.x + this.width > obj.x &&
                this.y < obj.y + obj.height &&
                this.height + this.y > obj.y) {

                // če se odbije od spodnje stranice
                if (this.cancollide) {
                    this.dx = -this.dx;
                    this.cancollide = false;
                    setTimeout(() => { mojazoga.cancollide = true; }, 1000);
                } else {
                    this.dy = -this.dy;
                    this.dx = -this.dx;
                    this.y += this.dy * 4;
                }
            }
        })
    }
}

function start() {
    let w = window.innerWidth * 0.9;
    let h = window.innerHeight * 0.9;
    canvas.width = w;
    canvas.style.width = w;
    canvas.height = h;
    canvas.style.height = h;
    relx = Math.round(canvas.width / 600);
    rely = Math.round(canvas.height / 200);

    mojadeska = new deska(leva)
    mojadeska.color = "#00FF00";
    drugadeska = new deska(!leva);
    mojazoga = new zoga();
    objects = [mojadeska, mojazoga, drugadeska];

    document.addEventListener('keydown', logKeydown);
    document.addEventListener('keyup', logKeyup);

    gameinterval = setInterval(update, 1000 / 60);
    serverupdateinterval = setInterval(sendUpdate, 1000 / 20);
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => { obj.update(); obj.draw(); });
}

function die(who) {
    if (!gameover) {
        document.getElementById("waiting").style.display = "block";
        document.getElementById("game").style.display = "none";
        document.getElementById("waitingtext").innerText = `${who} has won!`
        setTimeout(()=>{window.location.reload();}, 3000);
        socket.emit('gameover', roomid);
    }
    gameover = true;
}

function sendUpdate() {
    let data = {
        data: {
            deska: {
                y: mojadeska.getRelativeXY().y,
                dy: mojadeska.getRelativeXY().dy,
            },
            zoga: {
                x: mojazoga.getRelativeXY().x,
                y: mojazoga.getRelativeXY().y,
                dx: mojazoga.getRelativeXY().dx,
                dy: mojazoga.getRelativeXY().dy,
            },
            playerid: id,
        },
        roomid: roomid,
    };
    socket.emit('update', data);
}

function logKeydown(e) {
    if (e.keyCode == 87) {
        //w
        mojadeska.dy = -rely;
    }
    if (e.keyCode == 83) {
        //s
        mojadeska.dy = rely;
    }
}
function logKeyup(e) {
    if (e.keyCode == 87) {
        //w
        mojadeska.dy = 0;
    }
    if (e.keyCode == 83) {
        //s
        mojadeska.dy = 0;
    }
}

socket.on('update', data => {
    console.log(data);
    //naredi update    poskus:
    if (data.deska != undefined) drugadeska.setRelativeXY(data.deska.x, data.deska.y, 0, data.deska.dy);
    if (data.zoga != undefined) mojazoga.setRelativeXY(data.zoga.x, data.zoga.y, data.zoga.dx, data.zoga.dy);
})