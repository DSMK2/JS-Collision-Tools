window.range = 50;
window.onload = function() {
	var mousePosition = {x: 0, y: 0};
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var x = 0;
	var y = 0;
	var sizeX = 50;
	var sizeY = 50;
	var posX = Math.floor(Math.random()*sizeX);
	var posY = Math.floor(Math.random()*sizeY);
	var obstacleRectsArr = [];
	var fps = 60;
	var updateInterval;
	var nodes;
	var spatialHash = new SpatialHash(50, 50);
	var target;
	
	context.canvas.width  = canvas.clientWidth;
	context.canvas.height = canvas.clientHeight;
	
	// BEGIN: Obstacle Rects
	function obstacleRects(x, y, width, height, cost) {
		
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		this.cost = typeof cost !== 'undefined' ? cost : undefined;
	}
	
	obstacleRects.prototype = {
		redraw: function(){
		
			context.beginPath();
			context.fillStyle="#000000";
			context.rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
			context.fill();
			context.closePath();
		}
	}
	target = new obstacleRects(800, 300, 25, 25);
	obstacleRectsArr.push(new obstacleRects(200, 90, 100, 150));
	obstacleRectsArr.push(new obstacleRects(600, 200, 150, 100, 5));
	//obstacleRectsArr.push(target);
	
	// END: Obstacle Rects
	
	events : {
		$(window).on('mousemove', function(e) {
			mousePosition.x = e.clientX-$(canvas).offset().left;
			mousePosition.y = e.clientY-$(canvas).offset().top;
		});
	}
	
	function update() {
		var r = 0;
		
		spatialHash.clear();
	
		for(r = 0; r < obstacleRectsArr.length; r++) {
			spatialHash.insert(obstacleRectsArr[r].x, obstacleRectsArr[r].y, obstacleRectsArr[r].width, obstacleRectsArr[r].height, obstacleRectsArr[r]);
		}
		
		nodes = breadthFirstSearch({x: mousePosition.x-25/2, y: mousePosition.y-25/2, width: 25, height: 25}, undefined, {
			range: 50,
			nodeTest: function(x, y, size) {
				var results = spatialHash.retrieve(x+size/2, y+size/2, size, size);
				var testObject;
				var r = 0;
				var hit = false;
				var hitCount = 0;
				
				for(r = 0; r < results.length; r++) {
					testObject = results[r];
					
					if(!hit) {
						hit = AABB({x: x+size/2, y: y+size/2, width: size, height: size}, testObject);
						
						if(hit && typeof testObject.cost !== 'undefined')
							hit = testObject.cost
					}
					
					if(hit) break;
				}

				return (typeof hit === 'number' ? hit : !hit);
				
			},
			targetPosition: {x: 800, y: 300}
		});
		//redraw();

	}
	
	function redraw(){
		var o = 0;
		var prop;
		var prop2;
		var node;
	 
		
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		for(o = 0; o < obstacleRectsArr.length; o++) {
			obstacleRectsArr[o].redraw();
		}

		

		for(prop in nodes) {

			node = nodes[prop];
				
			context.beginPath();
			context.rect(node.x, node.y, node.size, node.size);
			
			context.stokeStyle='#000000';
			context.fillStyle= node.visited ? '#ffae00' : (node.costOffset !== 0 ? '#00ff00' : '#999999');
			
			context.fill();
			context.stroke();
			context.fillStyle= '#000000';
			context.fillText(node.cost + ' ' + node.arrow, node.x, node.y+node.size/2);
			context.closePath();

		}



		target.redraw();
		

		window.setTimeout(function() {
			window.requestAnimationFrame(function() {
				redraw();
			});
		}, 1000/fps);

	}
	
	//redraw();
	
	updateInterval = window.setInterval(function(){
		update();
	}, 1000/fps);

	window.requestAnimationFrame(function() {
		redraw();
	});
}