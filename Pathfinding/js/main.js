window.onload = function() {
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
	context.canvas.width  = canvas.clientWidth;
	context.canvas.height = canvas.clientHeight;
	
	// BEGIN: Obstacle Rects
	function obstacleRects(x, y, width, height) {
		
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	
	obstacleRects.prototype = {
		redraw: function(){
		
			context.beginPath();
			context.rect(this.x-this.width/2, this.y-this.height/2, this.width, this.height);
			context.fill();
			context.closePath();
		}
	}
	
	obstacleRectsArr.push(new obstacleRects(200, 90, 100, 150));
	obstacleRectsArr.push(new obstacleRects(600, 200, 150, 100));
	// END: Obstacle Rects
	
	
	
	
	function update() {
		nodes = breadthFirstSearch({x: 200, y: 200, width: 25, height: 25}, undefined, {
			range: 5
		});
	}
	
	function redraw(){
		var o = 0;
		var prop;
		var prop2;
		var node;
	 
		
		for(o = 0; o < obstacleRectsArr.length; o++) {
			obstacleRectsArr[o].redraw();
		}
		
		window.setTimeout(function() {
			window.requestAnimationFrame(function() {
				redraw();
			});
		}, 1000/fps);
		
		for(prop in nodes) {
			node = nodes[prop];
			console.log(node);
					
			context.beginPath();
			context.rect(node.x*node.cellSize, node.y*node.cellSize, node.cellSize, node.cellSize);
		
		
			context.fillStyle= typeof node.origin === 'undefined' ? '#ff0000' : '#8b8e89';
			context.stokeStyle='#ffffff';
			context.fill();
			context.fillStyle="#000000";
			context.fillText(node.distance, node.x*node.cellSize+node.cellSize/2, node.y*node.cellSize+node.cellSize/2);
		
			context.stroke();
			context.closePath();
		}
	}
	
	redraw();
	
	updateInterval = window.setInterval(function(){
		update();
	}, 1000/fps);
	
	window.requestAnimationFrame(function() {
		redraw();
	});
}