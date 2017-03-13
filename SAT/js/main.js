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
	},
	// SAT TEST RESULT 
	testResult;
	
	var daxes;
	
	function drawAxes(axes) {
		daxes = axes;
	}
	
	function FloatRects(x, y, points, isPlayer) {
		var i = 0,
		minX,
		minY,
		maxX,
		maxY;
		
		// Must have x, y, width, height set;
		if(typeof x !== 'number' || typeof y !== 'number')
			return;
		
		// Needed for spatial hash
		this.isPlayer = isPlayer;
		this.overlap = false;
		this.x = x;
		this.y = y;
		
		this.orig_vertices = points;
		this.vertices = [];
		for(i = 0; i < this.orig_vertices.length; i++) {
			if(typeof minX === 'undefined' || this.orig_vertices[i].x < minX)
				minX = this.orig_vertices[i].x;
			else if(typeof maxX === 'undefined' || this.orig_vertices[i].x > maxX)
				maxX = this.orig_vertices[i].x;
			
			if(typeof minY === 'undefined' || this.orig_vertices[i].y < minY)
				minY = this.orig_vertices[i].y;
			else if(typeof maxY === 'undefined' || this.orig_vertices[i].y > maxY)
				maxY = this.orig_vertices[i].y;
			
			this.vertices.push({x: this.orig_vertices[i].x + this.x, y: this.orig_vertices[i].y + this.y});

		}
		
		this.width = maxX - minX;
		this.height = maxY - minY;
		console.log(this.vertices);
		this.vel = 0;
		this.dir = 360 * Math.random();
		return this;
	}
	
	FloatRects.prototype = {
		update: function() {
			var newX,
			newY
			i = 0;
			
			if(this.isPlayer) {
				this.x = mouseData.x;
				this.y = mouseData.y;
			} else if(this.vel !== 0) {
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
			
			for(i = 0; i < this.vertices.length; i++) {
				this.vertices[i].x = this.orig_vertices[i].x + this.x;
				this.vertices[i].y = this.orig_vertices[i].y + this.y;
			}
			
			//console.log(this.x, this.y, this.vertices[0], this.m_vertices[0]);
		},
		redraw: function() {
			context.beginPath();
			context.strokeStyle = this.isPlayer ? '#00FF00' : (this.overlap ? '#FF0000' : '#FFFFFF');
			context.lineWidth = 2;
			var vertex;
			
			if(typeof this.vertices === 'undefined')
				return; 
				
			for(var i = 0; i < this.vertices.length; i++) {
				vertex = this.vertices[i];
				
				if(i === 0)
					context.moveTo(vertex.x, vertex.y)
				else
					context.lineTo(vertex.x, vertex.y);
				
				if(i+1 === this.vertices.length)
					context.lineTo(this.vertices[0].x, this.vertices[0].y);
			}
			
			context.stroke();
			//context.strokeRect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
			
			context.closePath();
		}
	};
	
	context.canvas.width = canvas.clientWidth;
	context.canvas.height = canvas.clientHeight
	
	
	var testRect = new FloatRects(context.canvas.width/2, context.canvas.height/2, [
		{x: -100, y: -50},
		{x: 10, y: -100},
		{x: 50, y: -50},
		{x: 60, y: 50},
		{x: 0, y: 80},
		{x: -50, y: 50}
	], false);
	rects.push(testRect);
	spatialHash.insert(testRect);
	
	
	var playerRect = new FloatRects(context.canvas.width/2, context.canvas.height/2, [
		{x: -25, y: -25},
		{x: 30, y: -25},
		{x: 80, y: 0},
		{x: 20, y: 25},
		{x: -30, y: 10}
	], true);
	rects.push(playerRect);
	spatialHash.insert(playerRect);
	
	function update() {
		var i = 0,
		targetRects;
		
	
		
		spatialHash.clear();
		
		for(i = 0; i < rects.length; i++) {
			rects[i].update();
			rects[i].overlap = false;
			spatialHash.insert(rects[i].x, rects[i].y, rects[i].width, rects[i].height, rects[i]);
		}
		
		targetRects = spatialHash.retrieve(playerRect.x, playerRect.y, playerRect.width, playerRect.height);
		
		for(i = 0; i < targetRects.length; i++)
		{
		
			
			if(targetRects[i] !== playerRect) {
				testResult = SATTest(targetRects[i], playerRect);
				if(testResult)
					targetRects[i].overlap = true;
			}
		}
	}
	
	function redraw() {
		var i = 0,
		mta,
		vector;
		
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
		
		if(typeof testResult !== 'undefined' && typeof testResult.magnitude !== 'undefined' && typeof testResult.axis !== 'undefined') {
			mta = testResult.magnitude;
			vector = testResult.axis;
			//console.log(mta, vector);
			context.beginPath();
			context.strokeStyle = '#FFAE00';
			context.lineWidth = 2;
			if(testResult.origin == playerRect) {
				context.moveTo(playerRect.x, playerRect.y);
				context.lineTo(playerRect.x+vector.x*mta, playerRect.y+vector.y*mta);
			} else {
				context.moveTo(rects[0].x, rects[0].y);
				context.lineTo(rects[0].x+vector.x*mta, rects[0].y+vector.y*mta);
			}
			context.stroke();
			context.closePath();
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