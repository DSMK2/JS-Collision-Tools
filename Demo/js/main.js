window.range = 50;
window.onload = function() {
	var mousePosition = {x: 0, y: 0};
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var fps = 60;
	var points;
	var player;
	
	/**
	* @function extend 
	* @description Returns an object that has 'default' values overwritten by 'options', otherwise default values. Properties not found in defaults are skipped.
	* @param {object} defaults - Object with the default values
	* @param {object} options - Object with values
	* @returns {object} - Object that has 'default' values overwritten by 'options', otherwise default values.
	*/
	function extend(defaults, options) {
		var prop,
		result = {};
		
		if(typeof options === 'undefined')
			return defaults;
		
		for(prop in defaults) {
			if(options.hasOwnProperty(prop))
				result[prop] = options[prop];
			else 
				result[prop] = defaults[prop];
		}
		
		return result;
	}
	
	/**
	* @function drawWithRotation
	* @description Helper function draw elements with a given angle of rotation
	* @param {object} context - Context to work with
	* @param {number} x - X origin to rotate
	* @param {number} y - Y origin to rotate
	* @param {number} rotation - Rotation in degrees to rotate
	* @param {function} callback - Function that draws something
	*/
	function drawWithRotation(context, x, y, rotation, callback) {
			context.beginPath();
			
			context.translate(x, y);
			context.rotate(rotation * Math.PI / 180);
			
			callback(context);
			
			context.rotate(-(rotation * Math.PI / 180));
			context.translate(-x, -y);
			
			context.closePath();
	}
	
	/**
	* @function getAngleToPosition
	* @description Returns angle between coordinates
	* @param {number} x1 - X coordinate of first position
	* @param {number} y1 - Y coordinate of first position
	* @param {number} x2 - X coordinate of second position
	* @param {number} y2 - Y coordinate of second position
	* @returns {number} - Angle in radians 
	*/
	function getAngleToPosition (x1, y1, x2, y2)
	{
		var angle = -1;
		var x = x2 - x1;
		var y = y2 - y1;
		
		angle = Math.atan2(y, x);
		
		angle = angle < 0 ? angle+(2*Math.PI) : angle;
		
		return angle;
	}
	
	/**
	* @function getShortestAngle
	* @description Returns the shortest angle from angleFrom to angleTo
	* @param {number} angleFrom - Origin angle in radians
	* @param {number} angleTo - Destination angle in radians
	* returns {number} - Angle in radians
	*/
	function getShortestAngle(angleFrom, angleTo) {
		var dir;
		var angleDelta;
		
		angleFrom*=Math.PI/180;
		angleTo*=Math.PI/180;
		
		// Get direction rotation is going to happen
		dir = Math.cos(angleFrom)*Math.sin(angleTo)-Math.sin(angleFrom)*Math.cos(angleTo) > 0 ? 1 : -1;
		
		// Offset angle target to match direction i.e. if the direction is possitive and the current angle is 360, the destination is 360 plus
		angleTo = dir > 0 && angleTo < angleFrom ? angleTo+=2*Math.PI : angleTo;
		
		// Find amount of rotation
		angleDelta = angleTo-angleFrom;
		
		// Find shortest angle to rotate to 
		while(angleDelta < -Math.PI) { angleDelta += 360*Math.PI/180; }
		while(angleDelta > Math.PI) { angleDelta -= 360*Math.PI/180; }
		
		return angleDelta;
		
	}
	
	// BEGIN: Projectile
	function Projectile(options) {
		var defaults = {
			polygon: [
				{x: 15, y: 0},
				{x: -10, y: -10},
				{x: -10, y: 10},
			],
			position: {x: 0, y: 0},
			velocity: {x: 0, y: 0},
			rotation: 0,
			lifetime: 10000			// Milliseconds to live
		};
		
		options = extend(defaults, options);
		
		this.polygon = options.polygon;
		this.position = options.position;
		this.velocity = options.velocity;
		this.rotation = options.rotation;
		

		this.endTime = (new Date()).getTime() + options.lifetime;
		this.index = Projectile.projectiles.length;
		
		Projectile.projectiles.push(this);
		
		return this;
	}
	
	Projectile.projectiles = [];
	
	Projectile.prototype = {
		update: function() {
		
			if((new Date()).getTime() >= this.endTime) {
				return;
			} 
		
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
			
			
		},
		redraw: function() {
			var _this = this;

			drawWithRotation(context, this.position.x, this.position.y, this.rotation, function(context) {
				var i = 1;
				var point;
				
				
				context.moveTo(_this.polygon[0].x, _this.polygon[0].y); 
				
				for(i = 1; i < _this.polygon.length; i++) {
					point = _this.polygon[i];
					context.lineTo(point.x, point.y);		
				}
				
				context.lineTo(_this.polygon[0].x, _this.polygon[0].y); 
				
				context.fillStyle = "#f00";
				context.fill();
				context.stroke();
			
			});
			
		}
	}
	// END: Projectile
	
	// BEGIN: Player
	function Player(options) {
		var defaults = {
			rotation: 0,
			hp: 1,
			position: {x: 0, y: 0}
		};
		
		options = extend(defaults, options);
		
		this.rotation = options.rotation;
		this.hp = options.hp;
		this.position = options.position;
	}
	
	Player.prototype = {
		redraw: function() {
				
			drawWithRotation(context, this.position.x, this.position.y, this.rotation, function(context) {
				context.rect(-50/2, -20/2, 50, 20);
				context.fillStyle = '#000';
				context.fill();
			});
			
		},
		setRotation: function(degrees) {
			this.rotation = degrees;
		},
		fire: function() {
			console.log(this.rotation);
			new Projectile({
				position: extend(this.position, {}),
				velocity: {x: 5*Math.cos(this.rotation*Math.PI/180), y: 5*Math.sin(this.rotation*Math.PI/180)},
				rotation: this.rotation
			});
		}
	}
	// END: Player
	
	// BEGIN: Enemy 
	function Enemy(options) {
	
		var defaults = {
			hp: 1,
			position: {x: 0, y: 0},
			rotation: 0
		}
		
		this.position = options.position;
		this.hp = options.hp;
		this.rotation = options.rotation;
		 
		this.path;
	}
	
	Enemy.prototype = {
		update: function(){
		}
	};
	// END: Enemy
	
	// BEGIN: Init
	init: {
		var width;
		var height;
		
		context.canvas.width = canvas.clientWidth;
		context.canvas.height = canvas.clientHeight;
		
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		
		player = new Player({
			position: {x: width/2, y: height/2}
		});
	}
	// END: Init
	
	// BEGIN: Events
	events : {
		$(window).on('mousemove', function(e) {
			mousePosition.x = e.clientX-$(canvas).offset().left;
			mousePosition.y = e.clientY-$(canvas).offset().top;
		});
		
		window.onmousedown = function(e) {
			console.log(e.which);
			
			switch(e.which) {
				case 1:
					player.fire();
					break;
				default:
					break;
			}
		};
	}
	// END: Events
	
	function update(){
		var angle = getAngleToPosition(player.position.x, player.position.y, mousePosition.x, mousePosition.y)*(180/Math.PI);
		var shortestAngle = getShortestAngle(player.rotation, angle); 
		
		player.setRotation(angle);
		
		(function() {
			var projectile;
			for(i = 0; i < Projectile.projectiles.length; i++) {
				projectile = Projectile.projectiles[i];
				projectile.update();
			}
		})();
	};
	
	function redraw(){
		var i = 0;
		
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		player.redraw();
		
		(function() {
			var projectile;
			for(i = 0; i < Projectile.projectiles.length; i++) {
				projectile = Projectile.projectiles[i];
				projectile.redraw();
			}
		})();
		
		window.requestAnimationFrame(function() {
			redraw();
		});
	};
	
	
	
	updateInterval = window.setInterval(function(){
		update();
	}, 1000/fps);

	window.requestAnimationFrame(function() {
		redraw();
	});
}