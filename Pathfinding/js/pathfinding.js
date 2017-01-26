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
		targetPosition: undefined
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
	var finished = false;
	var targetX;
	var targetY;
	var needsFinish = false;
	var startNode;
	
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
	
	
	if(typeof options.targetPosition !== 'undefined') {
		// Calculate grid position here
		targetX = options.targetPosition.x/cellSize;
		targetY = options.targetPosition.y/cellSize;
	}

	
	//new node(x, y);
	
	function Node(x, y, origin) {

		//console.log('node:', options);
		this.visited = false;
		this.distance = 0; // = typeof distance !== 'undefined' ? distance : 0; // Distance from origin
		this.neighbors = {};
		this.origin = undefined;
		this.x = x;
		this.y = y;
		this.gridX = Math.round(x);
		this.gridY = Math.round(y);
		this.nodeSize = cellSize;
		this.visited = false;
		this.arrow = '';
		if(typeof origin !== 'undefined' && origin instanceof Node) {
			this.distance = origin.distance + 1;
			this.origin = origin;
		}
		
		if(typeof nodeCallback === 'function') {
			nodeCallback(this, x, y, cellSize);
		}
		
		//console.log('node: Grid position at ' + x + ' ' + y);
		
		return this;
	}
	
	Node.grid = {
	};
	
	/**
	* @function node.testSpace
	* @description Tests a given (grid) space to see if it is available for a node
	* @params {number} x - x coordinate of grid position
	* @params {number} y - y coordinate of grid position
	* @param {number} [distance] - Optional value that forces true if overriding with a node of lower distance is allowed
	* @returns {boolean} - True if node has available space, false otherwise
	*/
	Node.testSpace = function (x, y, distance, curDist) {
		var result = false;
		
		if(typeof Node.grid[x] === 'undefined')
			result = true;
		else if(typeof Node.grid[x][y] === 'undefined')
			result = true;
		//else if(typeof distance === 'number' && (Node.grid[x][y].distance > distance ||  (typeof Node.grid[x][y].origin !== 'undefined' && Node.grid[x][y].origin.distance > curDist)))
			//result = true;
		
		// This becomes expensive
		if(result) {
			if(typeof nodeTest === 'function') {
				result = nodeTest(x, y, cellSize);
			}
		}
		
		if(x === targetX && y === targetY) {
			needsFinish = true;
		}
		
		//console.log('filled', node.grid[x][y], x, y);
		return result;
		
	}
	
	/**
	* @function node.addToGrid
	* @description Adds a node instance to the node.grid
	* @param {object} nodeInstance - node instance to add to the grid
	*/
	Node.addToGrid = function(nodeInstance) {
		// cell already exists, return
		/*
		if(typeof node.grid[x] !== 'undefined' && typeof node.grid[x][y] !== 'undefined') {
			//console.log('node: Grid position already occupied');
			return false;
		}
		*/
		
		if(typeof nodeInstance === 'undefined' || !(nodeInstance instanceof Node))
			return;
		
		if(typeof Node.grid[nodeInstance.gridX] === 'undefined')
			Node.grid[nodeInstance.gridX] = {};
		
		if(typeof Node.grid[nodeInstance.gridX][nodeInstance.gridY] === 'undefined')
			Node.grid[nodeInstance.gridX][nodeInstance.gridY] = nodeInstance;
	}
	
	Node.pathToTarget = function() {
		var currentNode;
		var nextNode;
		var lowestDistance;
		var prop;
		
		if(!needsFinish)
			return;
			
		currentNode = Node.grid[targetX][targetY];
		currentNode.visited = true;
		
		while(currentNode !== startNode) {
			
			currentNode = currentNode.origin;
			currentNode.visited = true;
		}
	
	}
	
	Node.prototype = {
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
			var x = this.x; 
			var y = this.y;
			var gridX = this.gridX;
			var gridY = this.gridY;
			var left;
			var top;
			var right;
			var bottom;
			var nodesAdded = [];
			var newDistance =  this.distance+1;

			if(Node.testSpace(gridX-1, gridY)) {
				left = new Node(x-1, y, this);
				this.addNeighbor('left', left);
				left.arrow = '>'
				Node.addToGrid(left);
				nodesAdded.push(left);
			}
				
			if(Node.testSpace(gridX, gridY-1)) {
				top = new Node(x, y-1, this);
				this.addNeighbor('top', top);
				top.arrow = 'V'
				Node.addToGrid(top);
				nodesAdded.push(top);
			}
				
			if(Node.testSpace(gridX+1, gridY)) {
				right = new Node(x+1, y, this);
				this.addNeighbor('right', right);
				right.arrow = '<'
				Node.addToGrid(right);
				nodesAdded.push(right);
			}
				
			if(Node.testSpace(gridX, gridY+1)) {
				bottom = new Node(x, y+1, this);
				this.addNeighbor('bottom', bottom);
				bottom.arrow = '^'
				Node.addToGrid(bottom);
				nodesAdded.push(bottom);
			}
			
			return nodesAdded;
		}
	};
	
	
	// Generate grid from start position
	(function() {
		var tempNodes = [];
		var nextNodes = [];
		var r = 0;
		var n = 0;
		
		// Must have a valid space for starting point
		if(Node.testSpace(Math.round(x/cellSize), Math.round(y/cellSize))) {
			startNode = new Node(x, y)
			nextNodes = [startNode];
			Node.addToGrid(nextNodes[0]);
	
		
			for(r = 0; r < range; r++) {
				for(n = 0; n < nextNodes.length; n++) {
					
					
					tempNodes = tempNodes.concat(nextNodes[n].floodFill());
					
					if(needsFinish)
						break;
				}
				nextNodes = tempNodes;
				tempNodes = [];
				
				if(needsFinish)
					break;
			}
			

		}
	})();
	
	Node.pathToTarget();
	
	return Node.grid;
}