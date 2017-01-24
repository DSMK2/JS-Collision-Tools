window.onload = function() {
	var 
	canvas = document.getElementById('canvas');
	context = canvas.getContext('2d');
	x = 0,
	y = 0,
	sizeX = 50,
	sizeY = 50,
	posX = Math.floor(Math.random()*sizeX),
	posY = Math.floor(Math.random()*sizeY);
	
	context.canvas.width  = canvas.clientWidth;
	context.canvas.height = canvas.clientHeight;
	
	breadthFirstSearch({x: 200, y: 200, width: 25, height: 25}, undefined, {
		nodeCallback: function(node, x, y, cellSize) {
			context.beginPath();
			context.rect(x*cellSize, y*cellSize, cellSize, cellSize);
			
			
			context.fillStyle= typeof node.origin === 'undefined' ? '#ff0000' : '#8b8e89';
			context.stokeStyle='#ffffff';
			
			context.fill();
			context.stroke();
			context.closePath();
			
			console.log('drawing');
		},
		range: 6
	})
	
	function update() {
	}
	
	function redraw(){
		/*
		var curX = 0,
		curY = 0, 
		maxX = canvas.width/sizeX,
		maxY = canvas.height/sizeY;

		for(curX = 1; curX <= maxX; curX++) {
			context.beginPath();
			context.strokeStyle = '#000000';
			context.lineWidth = 1;
			context.moveTo(curX*sizeX, 0);
			context.lineTo(curX*sizeX, canvas.height);
			context.stroke();
			context.closePath();
		}
		
		for(curY = 1; curY <= maxY; curY++) {
			context.beginPath();
			context.strokeStyle = '#000000';
			context.lineWidth = 1;
			context.moveTo(0, curY*sizeY);
			context.lineTo(canvas.width, curY*sizeY);
			context.stroke();
			context.closePath();
		}
		*/
		
		
	}
	
	//redraw();
	
}