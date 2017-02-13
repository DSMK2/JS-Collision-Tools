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
	
	// BEGIN: Player
	function Player(options) {
		var defaults = {
			rotation: 20,
			hp: 0,
			position: {x: 0, y: 0}
		};
		
		options = extend(defaults, options);
		
		this.rotation = options.rotation;
		this.hp = options.hp;
		this.position = options.position;
	}
	
	Player.prototype = {
		redraw: function() {
				
			drawWithRotation(context, this.position.x - 50/2, this.position.y - 20/2, this.rotation, function() {
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
	function enemy() {
	}
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
		//player.rotation+=5;
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