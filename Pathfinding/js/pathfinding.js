// Provide a destination, create a grid from that destination I guess
// Should be used with some sort of broad phase collision checking via callback
// See http://www.redblobgames.com/pathfinding/a-star/introduction.html
function breadthFirstSearch(polygon, callback, options) {
	var defaults = {
		xMin: undefined,
		xMax: undefined,
		yMin: undefined,
		yMax: undefined,
		range: undefined,
		nodeCallback: undefined,
		nodeTest: undefined,
		target: undefined
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
	var test = 0;
	var test2 = 0;
	var nextNodes;
	var range;
	var finished = false;
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
	nodeTest = options.nodeTest;
	range = options.range;
	
	x = polygon.x;
	y = polygon.y;
	width = polygon.width;
	height = polygon.height;
	
	cellSize = Math.max(width, height); // Largest dimension is used for cell size
	
	// Get start position
	x = x/cellSize; //Math.round(x/cellSize); 
	y = y/cellSize; //Math.round(y/cellSize); 
	
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
		this.distance = options.distance; // Distance from origin
		this.neighbors = {};
		this.origin = undefined;
		this.x = x;
		this.y = y;
		this.gridX = Math.round(x);
		this.gridY = Math.round(y);
		this.nodeSize = cellSize;
		
		options = extend(defaults, options);
		
		if(typeof options.origin !== 'undefined') {
			this.distance = options.origin.distance + 1;
			this.origin = options.origin;
		}
		
		if(typeof nodeCallback === 'function') {
			nodeCallback(this, x, y, cellSize);
		}
		
		//console.log('node: Grid position at ' + x + ' ' + y);
		
		return this;
	}
	
	node.testSpace = function (x, y, distance) {
		var result = false;
		
		if(typeof node.grid[x] === 'undefined')
			result = true;
		else if(typeof node.grid[x][y] === 'undefined')
			result = true;
		else if(node.grid[x][y].distance > distance)
			result = true;
			
		if(result) {
			/*
			 Callbacks should also test for a target; some special return value?
			*/
			if(typeof nodeTest === 'function') {
				result = nodeTest(x, y, cellSize);
			}
		}
	
		//console.log('filled', node.grid[x][y], x, y);
		return result;
		
	}
	
	node.addToGrid = function(nodeInstance) {
		// cell already exists, return
		if(typeof node.grid[x] !== 'undefined' && typeof node.grid[x][y] !== 'undefined') {
			//console.log('node: Grid position already occupied');
			return false;
		}
		
		if(typeof node.grid[nodeInstance.gridX] === 'undefined')
			node.grid[nodeInstance.gridX] = {};
		
		if(typeof node.grid[nodeInstance.gridX][nodeInstance.gridY] === 'undefined')
			node.grid[nodeInstance.gridX][nodeInstance.gridY] = nodeInstance;
	}
	
	node.prototype = {
		addNeighbor: function(dir, node) {
			var dirs = {
				left: 'left',
				top: 'top',
				right: 'right',
				bottom: 'bottom'
			};
	
			if(typeof dirs[dir] !== 'undefined') {
				
				if(typeof this.neighbors[dir] === 'undefined') 
					this.neighbors[dir] = node;
				
				// new neighbor node gets "this" node as its neighbor, based on the opposite of the direction entered
				if(dirs[dir] === 'left' && typeof node.neighbors.right === 'undefined')
					node.neighbors.right = this;
				else if(dirs[dir] === 'top' && typeof node.neighbors.bottom === 'undefined')
					node.neighbors.bottom = this;
				else if(dirs[dir] === 'right' && typeof node.neighbors.left === 'undefined')
					node.neighbors.left = this;
				else if(dirs[dir] === 'bottom' && typeof node.neighbors.top === 'undefined')
					node.neighbors.top = this;
			}
				
			return node;			
		},
		// Recursive does not work as it does one arm, then another, then another, and will cause the other calls to deal with already existing nodes
		floodFill: function(ignoreDirs) {
			var defaultOptions = {
				origin: this,
				distance: this.distance + 1
			};
			var x = this.x; 
			var y = this.y;
			var gridX = this.gridX;
			var gridY = this.gridY;
			var left;
			var top;
			var right;
			var bottom;
			var nodesAdded = [];
			
			/*
			// Maximum range reached
			if(this.distance >= range) {
				//console.log('node: floodFill: range reached: ' + range + ' stopping floodfill');
				finished = true;
				return;
			}
			*/

			if(node.testSpace(gridX-1, gridY, defaultOptions.distance)) {
				left = new node(x-1, y, defaultOptions);
				this.addNeighbor('left', left);
				node.addToGrid(left);
				nodesAdded.push(left);
			}
				
			if(node.testSpace(gridX, gridY-1, defaultOptions.distance)) {
				top = new node(x, y-1, defaultOptions);
				this.addNeighbor('top', top);
				node.addToGrid(top);
				nodesAdded.push(top);
			}
				
			if(node.testSpace(gridX+1, gridY, defaultOptions.distance)) {
				right = new node(x+1, y, defaultOptions);
				this.addNeighbor('right', right);
				node.addToGrid(right);
				nodesAdded.push(right);
			}
				
			if(node.testSpace(gridX, gridY+1, defaultOptions.distance)) {
			bottom = new node(x, y+1, defaultOptions);
				this.addNeighbor('bottom', bottom);
				node.addToGrid(bottom);
				nodesAdded.push(bottom);
			}
			
			return nodesAdded;
		}
	};
	
	
	// Generate grid from start position
	nextNodes = [new node(x, y)];
	node.addToGrid(nextNodes[0]);
	var tempNodes = [];
	for(test = 0; test < range; test++) {
		for(test2 = 0; test2 < nextNodes.length; test2++) {
			tempNodes = tempNodes.concat(nextNodes[test2].floodFill());
		}
		nextNodes = tempNodes;
		tempNodes = [];
	}
	//start.floodFill();
	
	return node.grid;
}