var canvas,
	ctx,
	WIDTH = 1028,
	HEIGHT = 768,
	OUTER = 50,
	OBJECTS = 3,
	DEFAULTASTEROIDSIZE = 40;

var buttonClick = false;
var currentKey = '';

var lastTime = (new Date()).getDate();
var timeDiff = 0;
var appState = 1;
var logTable = [];
var logInput;

var buttons = [];

function init() {

	window.requestAnimFrame = (function (callback) {
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function (callback) {
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	canvas = document.getElementById("canvas");
	canvas.width = WIDTH;
	canvas.height = HEIGHT;
	ctx = canvas.getContext("2d");

	canvas.onmouseup = canvasUp;
	canvas.onmousemove = canvasMove;
	canvas.onmousedown = canvasClick;
	canvas.onkeydown = keyDown;
	canvas.onkeyup = keyUp;
	draw();

	for (var i = 0; i < OBJECTS; i++) {
		Level.asteroids.push(AsteroidFactory.Create());
	}
}

var Mouse = {
	x: 0,
	y: 0
}

var Level = {
	bullets: [],
	asteroids: [],
	draw: function () {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);

		this.applyInputs();

		for (var i = 0; i < this.asteroids.length; i++) {
			this.asteroids[i].move();
			this.asteroids[i].draw();
		}

		this.asteroids = _.filter(this.asteroids, function (el) { return el.active; });

		for (var i = 0; i < OBJECTS - this.asteroids.length; i++) {
			this.asteroids.push(AsteroidFactory.Create());
		}

		for (var i = 0; i < this.bullets.length; i++) {
			this.bullets[i].move();
			this.bullets[i].draw();
		}

		this.bullets = _.filter(this.bullets, function (el) { return el.active; });

		Ship.move();
		Ship.draw();
	},
	applyInputs: function () {
		switch (currentKey.toUpperCase()) {
			case 'W': Ship.forward(); break;
			case 'A': Ship.forward(); break;
			case 'D': Ship.forward(); break;
		}

		if (buttonClick) {
			Ship.fire();
		}
	}
}

var Ship = {
	x: WIDTH / 2,
	y: HEIGHT / 2,
	alpha: 0,
	dx: 0,
	dy: 0,
	friction: 0.98,
	lastShot: 0,

	move: function () {
		this.x += this.dx;
		this.y += this.dy;
		this.dx *= this.friction;
		this.dy *= this.friction;
		
		if(this.x < 0) this.x = WIDTH;
		if(this.x > WIDTH) this.x = 0;
		if(this.y < 0) this.y = HEIGHT;
		if(this.y > HEIGHT) this.y = 0;
	},

	fire: function () {
		if (lastTime - this.lastShot > 200) {
			Level.bullets.push(new Bullet(this.x, this.y, this.turn().x, this.turn().y, Ship.alpha));
			Sounds.popp();
			this.lastShot = lastTime;
		}
	},

	forward: function () {
		turn = this.turn();
		this.dx += turn.x / 2;
		this.dy += turn.y / 2;
	},

	turn: function () {
		x1 = Mouse.x - this.x;
		y1 = Mouse.y - this.y;
		return {
			x: x1 / (Math.abs(x1) + Math.abs(y1)),
			y: y1 / (Math.abs(x1) + Math.abs(y1))
		};
	},

	draw: function () {
		this.alpha = Math.atan2(Mouse.x - this.x, Mouse.y - this.y);
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.alpha);
		ctx.moveTo(10, -15);
		ctx.lineTo(0, 15);
		ctx.lineTo(-10, -15);
		ctx.lineTo(0, -10);
		ctx.lineTo(10, -15);
		ctx.strokeStyle = '#FFF';
		ctx.fillStyle = '#000';
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.restore();
	}
}

var Asteroid = function (x, y, dx, dy, size) {
	this.x = x;
	this.y = y;
	this.dx = dx;
	this.dy = dy;
	this.active = true;
	this.alpha = 0;
	this.points = [];
	this.size = Math.random() * size + size;
	this.size2 = this.size * 0.7;
	this.points.push([Math.random() * 5 + this.size2, Math.random() * 5 + this.size2]);
	this.points.push([Math.random() * 5 + this.size, Math.random() * 5]);
	this.points.push([Math.random() * 5 + this.size2, Math.random() * 5 - this.size2]);
	this.points.push([Math.random() * 5, Math.random() * 5 - this.size]);
	this.points.push([Math.random() * 5 - this.size2, Math.random() * 5 - this.size2]);
	this.points.push([Math.random() * 5 - this.size, Math.random() * 5]);
	this.points.push([Math.random() * 5 - this.size2, Math.random() * 5 + this.size2]);
	this.points.push([Math.random() * 5, Math.random() * 5 + this.size]);

	this.move = function () {
		this.x += this.dx;
		this.y += this.dy;
		if (
			(this.x > WIDTH + OUTER || this.x < -OUTER) ||
			(this.y > HEIGHT + OUTER || this.y < -OUTER)
			) {
			this.active = false;
		}
	},

	this.draw = function () {
		ctx.save();
		ctx.beginPath();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.alpha);

		ctx.moveTo(this.points[0][0], this.points[0][1]);
		for (var i = 1; i < this.points.length; i++) {
			ctx.lineTo(this.points[i][0], this.points[i][1]);
		}
		ctx.lineTo(this.points[0][0], this.points[0][1]);

		ctx.strokeStyle = '#FFF';
		ctx.fillStyle = '#000';
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.restore();
	}
}

var Bullet = function (x, y, dx, dy, a) {
	this.x = x;
	this.y = y;
	this.dx = dx * 10;
	this.dy = dy * 10;
	this.active = true;
	this.alpha = a;
	this.friction = 2;

	this.move = function () {
		this.x += this.dx * this.friction;
		this.y += this.dy * this.friction;
		if (this.x > WIDTH || this.x < 0 || this.y > HEIGHT || this.y < 0) {
			this.active = false;
		}

		for (var i = 0; i < Level.asteroids.length; i++) {
			var asteroid = Level.asteroids[i];
			var rad = Math.sqrt(Math.pow(asteroid.x - this.x, 2) + Math.pow(asteroid.y - this.y, 2));
			if (rad < asteroid.size2) {

				this.active = false;
				asteroid.active = false;
				if (asteroid.size > 30) {
					for (j = 0; j < 2; j++) {
						Level.asteroids.push(new Asteroid(
							asteroid.x,
							asteroid.y,
							asteroid.dx * Math.pow(-1, j),
							asteroid.dy * Math.pow(-1, j + 1),
							asteroid.size / 2
							)
							);
					}
				}
				Sounds.explosion();
				break;
			}
		}
	},

	this.draw = function () {
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(-this.alpha);
		ctx.strokeStyle = "#FFF";
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.lineTo(0, 5);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	}
}

function draw() {
	var date = new Date();
	var time = date.getTime();
	timeDiff = time - lastTime;
	fps = 1000 / timeDiff;

	if (fps <= 50) {
		lastTime = time;
		Level.draw();
	}

	requestAnimFrame(function () {
		draw();
	});
}

function canvasUp() {
	buttonClick = false;
}

function canvasClick(event) {
	buttonClick = true;
}

function canvasMove(event) {
    var x = event.clientX;
    var y = event.clientY;
    x -= canvas.offsetLeft;
    y -= canvas.offsetTop;
    Mouse.x = x;
    Mouse.y = y;
}

function keyUp(event) {
	currentKey = '';
}

function keyDown(event) {
	x = event.keyCode;
	currentKey = String.fromCharCode(x);
}

var AsteroidFactory = {
	Create: function () {
		random = Math.random()
		if(random < 0.25) {
			width = 0 - OUTER /2;
			height = Math.random() * HEIGHT; 
		}
		else if(random < 0.5) {
			width = WIDTH + OUTER /2;
			height = Math.random() * HEIGHT;
		} else if(random < 0.75) {
			height = HEIGHT + OUTER /2;
			width = Math.random() * WIDTH;
		} else if(random < 1) {
			height = 0 - OUTER /2;
			width = Math.random() * WIDTH;
		}
		
		return new Asteroid(
			width,
			height,
			(Math.random() * 0.5 - Math.random()) * 11,
			(Math.random() * 0.5 - Math.random()) * 11,
			DEFAULTASTEROIDSIZE
			);
	}
}