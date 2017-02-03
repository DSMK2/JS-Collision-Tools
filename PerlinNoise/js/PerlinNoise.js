// SEE: http://flafla2.github.io/2014/08/09/perlinnoise.html
/*
var repeat = 0;

function PerlinNoise() {
	var permutation = [];
	var p = [];
	
	var i = 0;
	var targetIndex;
	var tempValue;
		
	// Generate numbers 0 - 255
	for(i = 0; i <= 255; i++) {
		permutation.push(i);
	}
	
	// Randomize value order using the Fisher-Yates Algorithm
	for(i = 0; i < permutation.length; i++) {
		targetIndex = permutation.length-1-Math.floor(Math.random()*(permutation.length-1-i));
		tempValue = permutation[i];
		permutation[i] = permutation[targetIndex];
		permutation[targetIndex] = tempValue;
	}
	
	for(i = 0; i <= 512; i++) {
		 p.push(permutation[i % 256 ];
	}
	

}

PerlinNoise.perlin(x, y, z) {
	if(repeat > 0) {
		x = x % repeat;
		y = y % repeat;
		z = z % repeat;
	}
	
	var xi = parseInt(x) & 255;
	var yi = parseInt(y) & 255;
	var zi = parseInt(z) & 255;
	
	var xf = x - parseInt(x);
	var yf = y - parseInt(y);
	var zf = z - parseInt(z);
	
}
*/

// SEE: http://www.redblobgames.com/maps/terrain-from-noise/
// SEE: http://lodev.org/cgtutor/randomnoise.html
// This is value noise
function valueNoise(width, height, frequency) {
	var x = 0;
	var y = 0;
	var noiseX;
	var noiseY;
	var values = [];
	var values2 = [];
	
	for(y = 0; y < height; y++) {
	
		values.push([]);
	
		for(x = 0; x < width; x++) {
			//noiseX = x / width - 0.5;
			//noiseY = y / height - 0.5;
			
			values[y].push((Math.random() * 32768) / 32768);

		}
	}
	
	// Smooth noise
	function smoothNoise(x, y, size){
		
		var fractX;
		var fractY;
		var x1;
		var y1;
		var x2;
		var x3;
		var value; 
		
		x = x/size;
		y = y/size;
		
		fractX = x - parseInt(x);
		fractY = y - parseInt(y);
		
		x1 = (parseInt(x) + width) % width;
		y1 = (parseInt(y) + height) % height;
		
		x2 = (x1 + width - 1) % width;
		y2 = (y1 + height - 1) % height;
		
		value = 0;
		value += fractX * fractY * values[y1][x1];
		value += (1 - fractX) * fractY * values[y1][x2];
		value += fractX * (1- fractY) * values[y2][x1];
		value += (1 - fractX) * (1 - fractY) * values[y2][x2]; 
				
		return value;
	}
	
	function turbulance(x, y, size) {
		var value = 0;
		var initialSize = size;
		
		while(size >= 1) {
			value += smoothNoise(x/size, y/size, frequency) * size;
			size /= 2;
		}
		return (value / initialSize);
	}
	
	for(y = 0; y < height; y++) {
		
		values2.push([]);
		for(x = 0; x < width; x++) {
			values2[y].push(turbulance(x, y, 64));
		}
	}
	
	return values2;
}

window.onload = function() {
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var grid;
	var width;
	var height;
	var imageData;
	var r = 0;
	var x = 0;
	var y = 0;

	context.canvas.width  = canvas.clientWidth;
	context.canvas.height = canvas.clientHeight;
	
	width = context.canvas.width;
	height = context.canvas.height;
	
	imageData = context.createImageData(width, height);
	
	grid = valueNoise(width, height, 4);
	
	function redraw() {
		
	
	}	
	
	(function() {
		var currentIndex;
		var currentGridCell;
		console.log(context, width, height);
		
		for(x = 0; x < width; x++) {
			for(y = 0; y < height; y++) {
				// /4 = zoom
				currentGridCell = grid[Math.round(y)][Math.round(x)];
			
				currentIndex = ((y * width) + x) * 4;
				imageData.data[currentIndex] = 255 * currentGridCell;
				imageData.data[currentIndex+1] = 255 * currentGridCell;
				imageData.data[currentIndex+2] = 255 * currentGridCell;
				imageData.data[currentIndex+3] = 255;
				
				
			}
		}
		
		console.log(imageData);
	})();
	console.log(imageData);
	
	window.setInterval(function() {
		window.requestAnimationFrame(function() {
			context.putImageData(imageData, 0, 0);
		});
	}, 1000/60);
	
	//redraw();
	
};
