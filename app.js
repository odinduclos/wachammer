'use_strict';
var dice = [];
var turn = 1;
var game = false;
var ships = [];
var shoots = [];
var selected = false;
var line = false;
var cursors;
var bg = false;
var group = false;
var shoots = [];
var count = 0;
var clicked = false;
var camera_x = 0;
var camera_y = 0;
var current_ship = 0;
var explosions = [];
var music = false;
var explode_sound = false;
var stations = [];

// TODO
// set velocity direction
// set velocity rotation
// set velocity from angle
// set group for collisions
// define hitboxs

window.onload = function () {

	var width = $(window).width();
	var height = $(window).height();

	// Converts from degrees to radians.
	Math.radians = function(degrees) {
	  return degrees * Math.PI / 180;
	};
	 
	// Converts from radians to degrees.
	Math.degrees = function(radians) {
	  return radians * 180 / Math.PI;
	};

	$("#dice").click(function (event) {
		event.preventDefault();
		if (selected && selected.pp > 0) {
			var value = Math.floor((Math.random() * 6) + 1);
			dice.push(value);
			$("#draws").append("<li>" + value + "</li>");
			selected.pp--;
			set_values(selected);
		} else {
			$("#log ul").prepend("<li>No more PP for orders</li>");
		}
	});

	$("#end").click(function (event) {
		event.preventDefault();
		if (selected) {
			unselect_ship(selected);
		}
		for (var i = 0; i < ships.length; i++) {
			ships[i].activated = false;
			ships[i].phase = 1;
			ships[i].pp = 5;
		};
		turn++;
		$("#log ul").prepend("<li>End of turn</li>");
	});

	$("#board").on("mouseover", function () {
		camera_x = 0;
	    camera_y = 0;
	});

	$("#log").on("mouseover", function () {
		camera_x = 0;
	    camera_y = 0;
	});

	$(window).on("mouseout", function () {
		camera_x = 0;
	    camera_y = 0;
	});

	$("#next").on("click", function (event) {
		event.preventDefault();
		game.camera.x = ships[current_ship].x - width / 2;
		game.camera.y = ships[current_ship].y - height / 2;
		current_ship++;
		if (current_ship == ships.length) {
			current_ship = 0;
		}
	});

	$("#phase").on("click", function () {
		if (selected) {
			if (selected.phase == 0) {
				selected.activated = true;
				$("#list_dice").show();
				$(this).html("End orders");
				selected.phase++;
			} else if (selected.phase == 1) {
				$("#list_dice").hide();
				$(this).html("End move");
				selected.phase++;
			} else if (selected.phase == 2) {
				$(this).html("End shoot");
				selected.phase++;
			} else if (selected.phase == 3) {
				unselect_ship(selected);
				selected.phase++;
			}
		} else {
			$("#log ul").prepend("<li>Select a ship</li>");
		}
	});

	$("#pause").on("click", function () {
		if (music.playing) {
			$(this).html("Play music");
			music.playing = false;
			music.pause();
		}
		else {
			$(this).html("Pause music");
			music.playing = true;
			music.resume();
		}
	});

	function maj_values_and_dices (dices) {
		set_values(selected);
		$("#draws").html("");
		for (var i = 0; i < dice.length; i++) {
			$("#draws").append("<li>" + dice[i] + "</li>");
		}
	}

	function update_shield (ship) {
		if (ship.shield > 0) {
			ship.getChildAt(1).visible = true;
		} else {
			ship.getChildAt(1).visible = false;
		}
	}

	$(".upgrade").click(function (event) {
		event.preventDefault();
		if (selected) {
			var value = $(this).data("value");
			if (value == 'shield') {
				if (selected.pp > 0) {
					selected.shield++;
					selected.pp--;
					update_shield(selected);
					set_values(selected);
					$("#log ul").prepend("<li>Add 1 to " + value + "</li>");
				} else {
					$("#log ul").prepend("<li>No more PP for shield</li>");
				}
			}
			else if (dice.length > 0) {
				if (value == 'life') {
					if (dice[0] == 6) {
						selected.life++;
						dice.splice(0, 1);
						maj_values_and_dices(dice);
						$("#log ul").prepend("<li>Add " + dice[0] + " to " + value + "</li>");
					} else {
						$("#log ul").prepend("<li>A six is required to add 1 life</li>");
					}
				} else {
					eval("selected." + value + " += dice[0]");
					dice.splice(0, 1);
					$("#log ul").prepend("<li>Add " + dice[0] + " to " + value + "</li>");
				}
				maj_values_and_dices(dice);
			} else {
				$("#log ul").prepend("<li>You should draw one or more dices to give orders</li>");
			}
		} else {
			$("#log ul").prepend("<li>Select a ship to give it orders</li>");
		}
	});

	$("#board").css("height", (height - 100) + "px");
	$("#log").css("height", (height - 100) + "px");
	$("#list_dice").hide();

	var game = new Phaser.Game(width, height, Phaser.AUTO, 'phaser', {preload: preload, create: create, update: update, render: render});
    function preload() {
        game.load.image('alien_fregate', 'img/alien.png');
        game.load.image('imperium_fregate', 'img/imperium.png');
        game.load.image('alien_destroyer', 'img/alien_big.png');
        game.load.image('imperium_destroyer', 'img/imperium_big.png');
        game.load.image('background', 'img/bg.png');
        game.load.image('selected', 'img/cogs.png');
        game.load.image('shield', 'img/shield.png');
		game.load.image('rocket', 'img/rocket_black.png');
		game.load.image('plasma', 'img/ball.png');
		game.load.spritesheet('ball', 'img/plasmaball.png', 128, 128);
		game.load.audio('bg_music', ['music/bg.mp3', 'music/bg.ogg']);
		game.load.audio('explode_music', ['music/explode.mp3', 'music/explode.ogg']);
		game.load.spritesheet('explosion', 'img/explosion.png', 200, 190, 5);
		game.load.image('station', 'img/spacestation.png');
		game.load.image('tribase', 'img/tribase.png');
    }

    function Ship (group, x, y, rotation, sprite, player) {

    	var ship = group.create(x, y, sprite);
        ship.anchor.setTo(0.5, 0.5);
        ship.rotation = Math.radians(rotation);
        ship.player = player;

        ship.shield = 0;
        ship.power = 0;
        ship.movement = 0;
        ship.activated = false;
        ship.phase = 0;
        ship.life = 10;
        ship.pp = 5;

        ship.is_moving = false;
        ship.rotate = 0;
        ship.degree = rotation;
        ship.forward = 0;
        ship.obj_rotation = 0;
        ship.obj_forward = 0;
        set_direction(ship, ship.degree);

        var selected_ship = game.make.sprite(0, 0, 'selected');
        selected_ship.anchor.setTo(0.5, 0.5);
        selected_ship.visible = false;
        ship.addChild(selected_ship);

        ship.inputEnabled = true;
        ship.events.onInputDown.add(select_listener, ship);

        game.physics.enable(ship, Phaser.Physics.ARCADE);
        ship.body.immovable = true;
        ship.body.setSize(100, 100, 0, 0);

        return ship;
    }

    function Fregate (group, x, y, rotation, sprite, player) {
    	var ship = Ship (group, x, y, rotation, sprite, player);
    	ship.life = 10;
        ship.pp = 5;
        ship.body.setSize(100, 150, 0, 0);
        var shield = game.make.sprite(0, 0, 'shield');
        shield.anchor.setTo(0.5, 0.5);
        shield.scale.setTo(0.7, 0.7);
        shield.visible = false;
        ship.addChild(shield);
        ship.model = 'fregate';
    	return ship;
    }

    function Destroyer (group, x, y, rotation, sprite, player) {
    	var ship = Ship (group, x, y, rotation, sprite, player);
    	ship.life = 15;
        ship.pp = 3;
        ship.body.setSize(150, 300, 0, 0);
        var shield = game.make.sprite(0, 0, 'shield');
        shield.anchor.setTo(0.5, 0.5);
        shield.scale.setTo(1, 1);
        shield.visible = false;
        ship.addChild(shield);
        ship.model = 'destroyer';
    	return ship;
    }

    function Station (group, x, y, sprite) {
    	var station = group.create(x, y, sprite);
        station.anchor.setTo(0.5, 0.5);
        station.angle = Math.random() * 360;
        game.physics.enable(station, Phaser.Physics.ARCADE);
        station.body.immovable = true;
        station.body.setSize(500, 500, 0, 0);
        var shield = game.make.sprite(0, 0, 'shield');
        shield.anchor.setTo(0.5, 0.5);
        shield.scale.setTo(1.7, 1.7);
        shield.visible = true;
        station.addChild(shield);
        return station;
    }

    function create () {

		bg = game.add.tileSprite(0, 0, 10000, 10000, 'background');
		group = game.add.group();

		game.world.setBounds(0, 0, 10000, 10000);

		music = game.add.audio('bg_music');
		music.playing = true;
    	music.play('',0,1,true);
    	explode_sound = game.add.audio('explode_music');

		cursors = game.input.keyboard.createCursorKeys();

		game.camera.x = game.world.centerX - width / 2;
		game.camera.y = game.world.centerY - height / 2;

		var it = Math.random() * 50;
		for (var i = 0; i < it; i++) {
			stations.push(new Station(group, Math.random() * game.world.width, Math.random() * game.world.height, 'tribase'));
		}
		var it = Math.random() * 50;
		for (var i = 0; i < it; i++) {
			stations.push(new Station(group, Math.random() * game.world.width, Math.random() * game.world.height, 'station'));
		}

        ships.push(Fregate(group, game.world.centerX - 500, game.world.centerY - 200, 90, 'alien_fregate', 0));
        ships.push(Destroyer(group, game.world.centerX - 550, game.world.centerY, 90, 'alien_destroyer', 0));
        ships.push(Fregate(group, game.world.centerX - 500, game.world.centerY + 200, 90, 'alien_fregate', 0));
        ships.push(Fregate(group, game.world.centerX + 500, game.world.centerY - 200, 270, 'imperium_fregate', 1));
        ships.push(Destroyer(group, game.world.centerX + 550, game.world.centerY, 270, 'imperium_destroyer', 1));
        ships.push(Fregate(group, game.world.centerX + 500, game.world.centerY + 200, 270, 'imperium_fregate', 1));

        game.input.mouse.onMouseMove = function (evt) {
        	if (evt.offsetX <= 50) {
        		camera_x = -20;
        	}
        	else if (evt.offsetX >= width - 50) {
        		camera_x = 20;
        	} else {
        		camera_x = 0;
        	}
        	if (evt.offsetY <= 50) {
        		camera_y = -20;
        	}
        	else if (evt.offsetY >= height - 50) {
        		camera_y = 20;
        	} else {
        		camera_y = 0;
        	}
	    };

    }

    function set_direction (ship, rotation) {
    	if (rotation >= 0 && rotation < 90) {
			ship.direction_x = 0;
			ship.direction_y = -1;
		} else if (rotation >= 90 && rotation < 180) {
			ship.direction_x = 1;
			ship.direction_y = 0;
		} else if (rotation >= 180 && rotation < 270) {
			ship.direction_x = 0;
			ship.direction_y = 1;
		} else if (rotation >= 270 && rotation < 360) {
			ship.direction_x = -1;
			ship.direction_y = 0;
		}
    }

    function move () {
    	selected.rotation += Math.radians(selected.rotate * 2);
    	selected.x += selected.forward * selected.direction_x * 2;
    	selected.y += selected.forward * selected.direction_y * 2;
    	game.camera.x += selected.forward * selected.direction_x * 2;
    	game.camera.y += selected.forward * selected.direction_y * 2;
    	selected.obj_rotation -= Math.abs(selected.rotate * 2);
    	selected.obj_forward -= selected.forward * 2;
    	if (Math.abs(selected.rotate) == 1 && selected.obj_rotation <= 0) {
    		if (selected.rotate == 1) {
    			selected.degree += 90;
    			if (selected.degree >= 360) {
    				selected.degree -= 360;
    			}
    		} else if (selected.rotate == -1) {
    			selected.degree -= 90;
    			if (selected.degree < 0) {
    				selected.degree += 360;
    			}
    		}
    		set_direction(selected, selected.degree);
    		selected.rotate = 0;
    		selected.is_moving = false;
    	}
    	if (selected.forward == 1 && selected.obj_forward <= 0) {
    		selected.forward = 0;
    		selected.is_moving = false;
    	}
    }

    function create_explosion (sprite) {
    	var explosion = game.add.sprite(sprite.x, sprite.y, 'explosion');
		explosion.anchor.setTo(0.5, 0.5);
	    explosion.animations.add('explode');
	    explosion.animations.play('explode', 10, false, true);
	    explode_sound.play('',0,1,false);
    }

    function update_collision(sprite, index) {
    	for (var i = 0; i < ships.length; i++) {
			var ret = game.physics.arcade.collide(sprite, ships[i], null, null, this);
			if (ret) {
				if (ships[i].shield > 0) {
					ships[i].shield--;
				}
				else ships[i].life--;
				create_explosion(sprite);
				sprite.destroy();
				shoots.splice(index, 1);
			}
			if (ret && ships[i].life <= 0) {
				ships[i].destroy();
				ships.splice(index, 1);
			}
		};
		for (var i = 0; i < stations.length; i++) {
			var ret = game.physics.arcade.collide(sprite, stations[i], null, null, this);
			if (ret) {
				create_explosion(sprite);
				sprite.destroy();
				shoots.splice(index, 1);
			}
		};
    }

    function update () {
    	game.camera.x += camera_x;
    	game.camera.y += camera_y;
    	count--;
    	if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
    		if (selected) {
	    		game.camera.x = selected.x - width / 2;
				game.camera.y = selected.y - height / 2;
			} else {
				game.camera.x = game.world.centerX - width / 2;
				game.camera.y = game.world.centerY - height / 2;
			}
    	}
    	for (var i = 0; i < shoots.length; i++) {
    		shoots[i].timer--;
    		update_collision(shoots[i], i);
    	}
	   	if (selected.is_moving) {
	   		line = false;
	   		move();
	   		return;
	   	}
	   	if (selected.phase == 2) {
		   	if (game.input.keyboard.isDown(Phaser.Keyboard.Q) && selected.movement > 0) {
		        selected.is_moving = true;
		        selected.rotate = -1;
		        selected.obj_rotation = 90;
		        $("#log ul").prepend("<li>Turn left</li>");
		        selected.movement--;
		        set_values(selected);
		        return;
		    }
		    else if (game.input.keyboard.isDown(Phaser.Keyboard.D) && selected.movement > 0) {
		        selected.is_moving = true;
		        selected.rotate = 1;
		        selected.obj_rotation = 90;
		        $("#log ul").prepend("<li>Turn right</li>");
		        selected.movement--;
		        set_values(selected);
		        return;
		    }

		    if (game.input.keyboard.isDown(Phaser.Keyboard.Z || Phaser.Keyboard.W) && selected.movement > 0) {
		        selected.is_moving = true;
		        selected.forward = 1;
		        selected.obj_forward = 200;
		        $("#log ul").prepend("<li>Move forward</li>");
		        selected.movement--;
		        set_values(selected);
		        return;
		    }
		}
		if (selected.phase == 3) {
		    if (game.input.keyboard.isDown(Phaser.Keyboard.S) && count <= 0 && selected.power > 0) {
		    	for (var i = 0; i < shoots.length; i++) {
		    		if (shoots[i] === null) {
		    			shoots.splice(i, 1);
		    		}
		    	}
		    	count = 50;
		    	if (selected.model == 'fregate')
		    		new Rocket(selected);
		    	else new Plasma(selected);
				selected.power--;
				set_values(selected);
		    	$("#log ul").prepend("<li>Shoot</li>");
		    	return;
		    }
		}
	}

	function Weapon (ship, x, y, sprite) {
		var weapon = group.create(ship.x, ship.y, sprite);
    	weapon.timer = 1000;
        weapon.anchor.setTo(0.5, 0.5);
        weapon.rotation = selected.rotation;
        weapon.player = selected.player;
        weapon.direction_x = selected.direction_x;
		weapon.direction_y = selected.direction_y;

		game.physics.enable(weapon, Phaser.Physics.ARCADE);
		weapon.body.velocity.x = weapon.direction_x * 300;
		weapon.body.velocity.y = weapon.direction_y * 300;
		weapon.body.setSize(50, 50, 0, 0);

		return weapon;
	}

	function Rocket (ship) {
		var weapon = new Weapon(ship, ship.x, ship.y, 'plasma');
		weapon.body.setSize(10, 10, 0, 0);
		weapon.timer = 1000;
		weapon.body.velocity.x = weapon.direction_x * 300;
		weapon.body.velocity.y = weapon.direction_y * 300;
		shoots.push(weapon);
		return weapon;
	}

	function Plasma (ship) {
		var weapon_front = new Weapon(ship, ship.x, ship.y, 'plasma');
		weapon_front.body.setSize(10, 10, 0, 0);
		weapon_front.timer = 2000;
		weapon_front.body.velocity.x = 1 * 500;
		weapon_front.body.velocity.y = 0 * 500;
		shoots.push(weapon_front);
		var weapon_top = new Weapon(ship, ship.x, ship.y, 'plasma');
		weapon_top.body.setSize(10, 10, 0, 0);
		weapon_top.timer = 2000;
		weapon_top.body.velocity.x = 0 * 500;
		weapon_top.body.velocity.y = -1 * 500;
		shoots.push(weapon_top);
		var weapon_bot = new Weapon(ship, ship.x, ship.y, 'plasma');
		weapon_bot.body.setSize(10, 10, 0, 0);
		weapon_bot.timer = 2000;
		weapon_bot.body.velocity.x = 0 * 500;
		weapon_bot.body.velocity.y = 1 * 500;
		shoots.push(weapon_bot);
		var weapon_back = new Weapon(ship, ship.x, ship.y, 'plasma');
		weapon_back.body.setSize(10, 10, 0, 0);
		weapon_back.timer = 2000;
		weapon_back.body.velocity.x = -1 * 500;
		weapon_back.body.velocity.y = 0 * 500;
		shoots.push(weapon_back);
		return ;
	}

	function set_values (ship) {
		$("#caracteristics").show();
		$("#life").html(ship.life);
		$("#shield").html(ship.shield);
		$("#power").html(ship.power);
		$("#movement").html(ship.movement);
		$("#pp").html(ship.pp);
		if (selected.phase === 0) {
			$("#list_dice").hide();
			$("#phase").html("Activate");
		} else if (selected.phase == 1) {
			$("#list_dice").show();
			$("#phase").html("End orders");
		} else if (selected.phase == 2) {
			$("#phase").html("End move");
		} else if (selected.phase == 3) {
			$("#phase").html("End shoot");
		}
	}

	function unset_values () {
		$("#caracteristics").hide();
		$("#list_dice").hide();
	}

	function unselect_ship (ship) {
		ship.children[0].visible = false;
		selected = false;
		$("#log ul").prepend("<li>Desactivate a ship</li>");
		$("#list_dice").hide();
		$("#phase").html("Activate");
		unset_values(ship);
	}

	function select_listener () {
		console.log('turn', turn);
		console.log(this.player);
		if (turn % 2 === 0 && this.player == 0) {
			hover_listener();
			return;
		}
		else if (turn % 2 == 1 && this.player == 1) {
			hover_listener();
			return;
		}
		if (selected.is_moving) {
	   		return;
	   	}
		if (this !== selected) {
			if (this.activated) {
				$("#log ul").prepend("<li>This ship has already been activated</li>");
				return;
			}
			for (var i = 0; i < ships.length; i++) {
				ships[i].children[0].visible = false;
				ships[i].selected = false;
			}
			this.children[0].visible = true;
			selected = this;
			$("#log ul").prepend("<li>Activate a ship<br />(click again to desactivate)</li>");
			set_values(this);
		} else if (this === selected) {
			unselect_ship(this);
		}
	}

	function hover_listener () {
		$("#enemy_caracteristics").show();
		$("#enemy_life").html(this.life);
		$("#enemy_shield").html(this.shield);
		$("#enemy_power").html(this.power);
		$("#enemy_movement").html(this.movement);
		$("#enemy_pp").html(this.pp);
	}

	function out_listener () {
		$("#enemy_caracteristics").hide();
	}

	function render () {
		// game.debug.body(selected);
	}
};