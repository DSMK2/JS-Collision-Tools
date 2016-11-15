window.onload = function() {
	var 
	// Canvas
	canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d'),
	// Test rectangles
	rects = [],
	spatialHash = new SpatialHash(50, 50),
	mouseData = {
		x: 0, 
		y: 0
	};
	
	function FloatRects(x, y, width, height, isPlayer) {
		
		// Must have x, y, width, height set;
		if(typeof x !== 'number' || typeof y !== 'number' || typeof width !== 'number' || typeof height !== 'number')
			return;
		
		// Needed for spatial hash
		this.isPlayer = isPlayer;
		this.overlap = false;
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		
		this.vel = 0.1;
		this.dir = 360 * Math.random();
		return this;
	}
	
	FloatRects.prototype = {
		update: function() {
			var newX,
			newY;
			
			if(this.isPlayer) {
				this.x = mouseData.x;
				this.y = mouseData.y;
			} else {
				 newX = this.x + this.vel*Math.cos(this.dir);
				newY = this.y + this.vel*Math.sin(this.dir);
			
				// Invert dir if bounds is exceeded
				if(newX > context.canvas.width 
					|| newX < 0
					|| newY > context.canvas.height
					|| newY < 0) {
					
						newX = this.x + this.vel*Math.cos(this.dir*Math.PI/180);
						newY = this.y + this.vel*Math.sin(this.dir*Math.PI/180);
						this.dir+=180;
				}
				
				this.x = newX;
				this.y = newY;
			}
		},
		redraw: function() {
			context.beginPath();
			context.strokeStyle = this.isPlayer ? '#00FF00' : (this.overlap ? '#FF0000' : '#FFFFFF');
			context.lineWidth = 2;
			context.strokeRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
			
			context.closePath();
		}
	};
	
	context.canvas.width = canvas.clientWidth;
	context.canvas.height = canvas.clientHeight

	for(var i = 0; i < 500; i++) {
		var rect = new FloatRects(context.canvas.width*Math.random(), context.canvas.height*Math.random(), 10*Math.random()+10, 10*Math.random()+10, false);
		rects.push(rect);
		spatialHash.insert(rect);
	}
	
	var playerRect = new FloatRects(context.canvas.width/2, context.canvas.height/2, 50, 50, true);
	rects.push(playerRect);
	spatialHash.insert(playerRect);
	
	function update() {
		var i = 0,
		targetRects;
		
		spatialHash.clear();
		
		for(i = 0; i < rects.length; i++) {
			rects[i].update();
			rects[i].overlap = false;
			spatialHash.insert(rects[i]);
		}
		
		targetRects = spatialHash.retrieve(playerRect.x, playerRect.y, playerRect.width, playerRect.height);
		
		for(i = 0; i < targetRects.length; i++)
		{
			if(AABB(targetRects[i], playerRect))
				targetRects[i].overlap = true;
		}
	}
	
	function redraw() {
		var i = 0;
		
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		// Black background for canvas
		context.beginPath();
		context.rect(0, 0, context.canvas.width, context.canvas.height);
		context.fillStyle = '#000000'
		context.fill();
		context.closePath();

		for(i = 0; i < rects.length; i++) {
			rects[i].redraw();
		}
		
		window.setTimeout(function(){
			window.requestAnimationFrame(redraw);
		}, 60/1000);
	}
	
	window.setInterval(function() {
		update();
	}, 60/1000);
	
	window.requestAnimationFrame(redraw);	
	
	window.onmousemove = function(e) {
		//console.log(e.clientX, e.clientY);
		var viewportPosition = canvas.getBoundingClientRect(),
		left = viewportPosition.left,
		top = viewportPosition.top;
		
		mouseData.x = e.clientX-left;
		mouseData.y = e.clientY-top;
	};
}