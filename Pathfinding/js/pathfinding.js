// Provide a destination, create a grid from that destination I guess
// Should be used with some sort of broad phase collision checking via callback
function breadthFirstSearch(polygon, callback, options) {
	var defaults = {
		xMin: undefined,
		xMax: undefined,
		yMin: undefined,
		yMax: undefined,
		range: undefined,
		nodeCallback: undefined,
		nodeTest: undefined
	};
	var x;
	var y;
	var width;
	var height;
	var cellSize = 0;
	var start;
	var nodeNew;
	var nodeCallback;
	var nodeTest;
	var range;
	
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
	
	if(typeof polygon === 'undefined')
		return;
	
	options = extend(defaults, options);
	
	nodeCallback = options.nodeCallback;
	noteTest = options.nodeTest;
	range = options.range;
	
	x = polygon.x;
	y = polygon.y;
	width = polygon.width;
	height = polygon.height;
	
	cellSize = Math.max(width, height); // Largest dimension is used for cell size
	
	// Get start position
	x = Math.round(x/cellSize); 
	y = Math.round(y/cellSize); 
	
	node.grid = {
	};
	
	//new node(x, y);
	
	function node(x, y, options) {
		var defaults = {
			origin: undefined,
			validCallback: undefined,
			distance: 0
		};
		
		options = extend(defaults, options);
		//console.log('node:', options);
		this.visited = false;
		this.distance = options.distance;
		this.neighbors = [];
		this.origin = undefined;
		this.x = x;
		this.y = y;
		// cell already exists, return
		if(typeof node.grid[x] !== 'undefined' && typeof node.grid[x][y] !== 'undefined') {
			console.log('node: Grid position already occupied');
			return false;
		}
		
		options = extend(defaults, options);
		
		if(typeof options.origin !== 'undefined') {
			this.distance = options.origin.distance + 1;
			this.origin = options.origin;
		}
		
		/*		
		if(typeof validCallback !== 'undefined') {
		}
		else {		
			
		
			if(typeof node.grid['x'] === 'undefined') {
				node.grid['x'] = {};
			}
		}
		*/
		
		
		if(typeof nodeCallback === 'function') {
			nodeCallback(this, x, y, cellSize);
		}
		
		//console.log('node: Grid position at ' + x + ' ' + y);
		
		if(typeof node.grid[x] === 'undefined')
			node.grid[x] = {};
		
		if(typeof node.grid[x][y] === 'undefined')
			node.grid[x][y] = this;
	}
	
	node.testSpace = function (x, y) {
		if(typeof nodeText === 'function') {
			console.log('test stuff');
			return nodeTest();
		}
	
		if(typeof node.grid[x] === 'undefined') {
			//console.log('first condition');
			return true;
		}
		
		if(typeof node.grid[x][y] === 'undefined') {
			//console.log('second condition');
			return true;
		}
		
		//console.log('filled', node.grid[x][y], x, y);
		return false;
		
	}
	
	node.prototype = {
		floodFill: function() {
			var defaultOptions = {
				origin: this,
				distance: this.distance + 1
			};
			var x = this.x; 
			var y = this.y;
			var left;
			var top;
			var right;
			var bottom;

			// Maximum range reached
			if(this.distance >= range) {
				//console.log('node: floodFill: range reached: ' + range + ' stopping floodfill');
				return;
			}
			
			
			if(node.testSpace(x-1, y))
				left = new node(x-1, y, defaultOptions);
				
			if(node.testSpace(x, y-1))
				top = new node(x, y-1, defaultOptions);
				
			if(node.testSpace(x+1, y))
				right = new node(x+1, y, defaultOptions);
				
			if(node.testSpace(x, y+1))
				bottom = new node(x, y+1, defaultOptions);
			
			//console.log('test', left, top, right, bottom);
			
			if(typeof left !== 'undefined') {
				this.neighbors.push(left);
				left.floodFill();
			}
				
			if(typeof top !== 'undefined') {
				this.neighbors.push(top);
				top.floodFill();
			}
				
			if(typeof right !== 'undefined') {
				this.neighbors.push(right);
				right.floodFill();
			}
				
			if(typeof bottom !== 'undefined') {
				this.neighbors.push(bottom);
				bottom.floodFill();
			}
				
		}
	}
	
	// Generate grid from position
	start = new node(x, y);
	start.floodFill();
	
	return node.grid;
}