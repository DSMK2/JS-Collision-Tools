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
	
	function drawWithRotation(context, x, y, rotation, callback) {
		context.beginPath();
			
			
			context.translate(x, y);
			context.rotate(rotation * Math.PI / 180);
			
			callback();
			
			context.rotate(-(rotation * Math.PI / 180));
			context.translate(-x, -y);
			
			context.closePath();
	}
	
	function getAngleToPosition (x1, y1, x2, y2)
	{
		var angle = -1;
		var x = x2 - x1;
		var y = y2 - y1;
		
		angle = Math.atan2(y, x);
		
		angle = angle < 0 ? angle+(2*Math.PI) : angle;
		
		return angle;
	}
	
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
		
		return angleDelta * 180/Math.PI;
		
	}
	
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
				
			drawWithRotation(context, this.position.x, this.position.y, this.rotation, function() {
				context.rect(-50/2, -20/2, 50, 20);
				context.fill();
			});
			
		},
		setRotation: function(degrees) {
			this.rotation = degrees;
		}
	}
	// END: Player
	
	// BEGIN: Enemy 
	function enemy(options) {
	
		var defaults {
			hp: 1,
			position: {x: 0, y: 0}
			rotation: 0;
		}
		
		this.position = options.position;
		this.hp = options.hp;
		this.rotation = options.rotation;
		 
		this.path;
	}
	
	enemy.prototype = {
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
	}
	// END: Events
	
	function update(){
		var angle = getAngleToPosition(mousePosition.x, mousePosition.y, player.position.x, player.position.y)*(180/Math.PI);
		var shortestAngle = getShortestAngle(player.rotation, angle); 
		
		player.setRotation(angle);
	};
	
	function redraw(){
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		player.redraw();
		
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