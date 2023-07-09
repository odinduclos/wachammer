// Converts from degrees to radians.
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

var ship = false;
var left = false;
var right = false;
var is_moving = false;
var rockets = [];
var victory = false;

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload() {

    //  You can fill the preloader with as many assets as your game requires

    //  Here we are loading an image. The first parameter is the unique
    //  string by which we'll identify the image later in our code.

    //  The second parameter is the URL of the image (relative)
    game.load.image('ship', '../img/alien.png');
    game.load.image('ship2', '../img/imperium.png');
    game.load.image('rocket', '../img/rocket_black.png');
    game.load.image('background', '../img/bg.png');

}

function create_ship (x, y, sprite) {
	var tmp = game.add.sprite(x, y, sprite);
    tmp.anchor.setTo(0.5, 0.5);
    tmp.velocity_x = 0;
    tmp.velocity_y = 0;
    tmp.degree = 0;
    tmp.speed = 50;
    game.physics.enable(tmp, Phaser.Physics.ARCADE);
    return tmp;
}

function create() {

    //  This creates a simple sprite that is using our loaded image and
    //  displays it on-screen
    bg = game.add.tileSprite(0, 0, 2000, 2000, 'background');
    game.world.setBounds(0, 0, 2000, 2000);
 	ship = create_ship(100, 100, 'ship');
    ship2 = create_ship(100, 300, 'ship2');

    game.input.mouse.onMouseMove = function (evt) {
		var x = evt.offsetX;
		var y = evt.offsetY;
		if (x >= 0 && x <= 50) {
			game.camera.x -= 10;
		}
		if (x >= 750 && x <= 800) {
			game.camera.x += 10;
		}
		if (y >= 0 && y <= 50) {
			game.camera.y -= 10;
		}
		if (y >= 750 && y <= 800) {
			game.camera.y += 10;
		}
	};

}

function move() {
	if (left) {
		ship.rotation -= Math.radians(1);
		ship.degree++;
	} else if (right) {
		ship.rotation += Math.radians(1);
		ship.degree++;
	}
	if (ship.degree == 0) {
		ship.velocity_y = -10;
		ship.velocity_x = 0;
		left = false;
		right = false;
		is_moving = false;
	}
	else if (ship.degree == 90) {
		ship.velocity_y = 0;
		ship.velocity_x = 10;
		left = false;
		right = false;
		is_moving = false;
	}
	else if (ship.degree == 180) {
		ship.velocity_y = 10;
		ship.velocity_x = 0;
		left = false;
		right = false;
		is_moving = false;
	}
	else if (ship.degree == 270) {
		ship.velocity_y = 0;
		ship.velocity_x = -10;
		left = false;
		right = false;
		is_moving = false;
	}
	else if (ship.degree == 360) {
		ship.velocity_y = -10;
		ship.velocity_x = 0;
		left = false;
		right = false;
		is_moving = false;
		ship.degree = 0;
	}
}

function collisionHandler (obj1, obj2) {
	obj1.destroy();
	obj2.destroy();
}

function update() {
	if (victory) {
		return;
	}
	if (game.physics.arcade.collide(ship, ship2, collisionHandler, null, this)) {
		victory = true;
		return;
	}
	move();
	for (var i = 0; i < rockets.length; i++) {
		rockets[i].timer--;
		if (rockets[i].timer == 0) {
    		rockets[i].destroy();
    	}
	};
	if (is_moving) {
		return;
	}
	if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        ship.body.velocity.x=ship.velocity_x * ship.speed;
        ship.body.velocity.y=ship.velocity_y * ship.speed;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    {
        ship.body.velocity.x-=ship.velocity_x * ship.speed;
        ship.body.velocity.y-=ship.velocity_y * ship.speed;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
    	left = true;
    	is_moving = true;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
    	right = true;
    	is_moving = true;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
    {
    	var rocket = game.add.sprite(ship.x, ship.y, 'rocket');
    	rocket.anchor.setTo(0.5, 0.5);
    	rocket.speed = 20;
    	rocket.timer = 50;
    	game.physics.enable(rocket, Phaser.Physics.ARCADE);
    	rocket.body.velocity.x=ship.velocity_x * rocket.speed;
        rocket.body.velocity.y=ship.velocity_y * rocket.speed;
        rockets.push(rocket);

    }
    else
    {
        ship.body.velocity.y=0;
        ship.body.velocity.x=0;
    }
}