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
	var nodes = [];
	var spatialHash = new SpatialHash(50, 50);
	var target;
	var simplex = new SimplexNoise();
	var size = 50;
	
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
	
	// BEGIN: Grid
	function GridNode (x, y, size, cost) {
		this.x = x;
		this.y = y;
		this.size = size,
		this.cost = cost;	
	}
	
	GridNode.prototype = {
		redraw: function(context) {
			var color = Math.round(150 * this.cost/5);
			
			if(typeof context === 'undefined')
				return;
			
			context.beginPath();
			context.rect(this.x, this.y, this.size, this.size);
			context.fillStyle = 'rgb(' + 0 + ', ' + color + ', ' + 0 + ')';
			context.strokeStyle = 'black';
			
			context.fill();
			context.stroke();
			context.fillStyle = 'black';
			context.fillText(this.cost, this.x + this.size/2, this.y + this.size/2);
			context.closePath();			
		}
	};
	
	// build a grid starting from the top left corner of the screen
	function Grid (size, costRange) {
		var x = 0;
		var y = 0;
		var xMax = Math.round(window.innerWidth/size);
		var yMax = Math.round(window.innerHeight/size);
		var cost;
		
		console.log(xMax, yMax);
		
		for(x = 0; x < xMax; x++) {
			for(y = 0; y < yMax; y++) {
				cost = Math.round(10 * Math.abs(simplex.noise2D(x/8, y/8)));
				//if(cost === 0)
					//cost = 999;
				//cost = 1;
				Grid.node[x + '_' + y] = new GridNode(x*size, y*size, size, cost);
			} 
		}
	}
	
	Grid.node = {};
	
	var grid = new Grid(size);
	// END: Grid
	
	events : {
		$(window).on('mousemove', function(e) {
			mousePosition.x = e.clientX-$(canvas).offset().left;
			mousePosition.y = e.clientY-$(canvas).offset().top;
		});
	}
	
	function update() {
		var r = 0;
		var prop;
		
		spatialHash.clear();
	
		for(prop in Grid.node) {
			if(Grid.node.hasOwnProperty(prop)) {
				spatialHash.insert(Grid.node[prop].x, Grid.node[prop].y, Grid.node[prop].size, Grid.node[prop].size, Grid.node[prop]);
			}
		}		
		
		nodes = breadthFirstSearch({x: Math.round((mousePosition.x-size/2)/size)*size, y: Math.round((mousePosition.y-size/2)/size)*size, width:size, height: size}, undefined, {
			range: 500,
			nodeTest: function(x, y, gridX, gridY, size) {
				var results = spatialHash.retrieve(x+size/2, y+size/2, size, size);
				var testObject;
				var r = 0;
				var hit = false;
				var hitCount = 0;
				var cost;
				
				if(typeof Grid.node[gridX + '_' + gridY] !== 'undefined') {
					cost = Grid.node[gridX + '_' + gridY].cost;
					return cost === 999 ? false : cost;
				}
				/*
				for(r = 0; r < results.length; r++) {
					testObject = results[r];
					
					if(!hit) {
						hit = AABB({x: x, y: y, width: 50, height: 50}, testObject);
						
						if(hit && typeof testObject.cost !== 'undefined')
							hit = testObject.cost;
					}

					if(hit) break;
				}

				return (typeof hit === 'number' ? hit : !hit);
				*/
				return !hit;
				
			},
			targetPosition: {x: 800, y: 300}
		});

	}
	
	function redraw(){
		var o = 0;
		var prop;
		var prop2;
		var node;
		var n;
	 
		
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		/*
		for(o = 0; o < obstacleRectsArr.length; o++) {
			obstacleRectsArr[o].redraw();
		}
		*/

		for(prop in Grid.node) {
			if(Grid.node.hasOwnProperty(prop)) {
				Grid.node[prop].redraw(context);
			}
		}		
		
		if(nodes.length !== 0) {
			context.globalAlpha = 0.5;
			for(n = 0; n < nodes.length; n++) {

				node = nodes[n];
				
				context.beginPath();
				context.rect(node.x, node.y, node.size, node.size);
			
				context.stokeStyle='#000000';
				context.fillStyle= node.visited ? '#ffffff' : (node.costOffset !== 0 ? '#821313' : '#999999');
			
				context.fill();
				context.stroke();
				context.fillStyle= '#000000';
				//context.fillText(node.cost + ' ' + node.arrow, node.x, node.y+node.size/2);
				context.closePath();

			}
			context.globalAlpha = 1;
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