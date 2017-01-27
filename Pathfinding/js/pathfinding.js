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
	var nodeSize = 0;
	var nodeCallback;
	var nodeTest;
	var range;
	var finished = false;
	var targetX;
	var targetY;
	var needsFinish = false;
	var startNode;
	var nextNodes = [];
	
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
	
	nodeSize = Math.max(width, height); // Largest dimension is used for cell size
	
	
	if(typeof options.targetPosition !== 'undefined') {
		// Calculate grid position here
		targetX = options.targetPosition.x/nodeSize;
		targetY = options.targetPosition.y/nodeSize;
	}
	
	/*
	 A Node Object 
		{
			x: Unrounded x coordinate
			y: Unrounded y coordinate
			gridX: Rounded x coordinate
			gridY: Rounded y coordinate
			size: node size
			distance: distance from starting position (gridwise)
			origin: Origin of node
		}
	*/
	
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
	Node.testSpace = function (x, y, gridX, gridY) {
		var result = false;
		
		if(typeof Node.grid[gridX + '_' + gridY] === 'undefined')
			result = true;

		if(result) {
			if(typeof nodeTest === 'function') {
				result = nodeTest(x, y, nodeSize);
			}
		}

		//console.log('filled', node.grid[x][y], x, y);
		return result;
		
	};
	
	/**
	* @function node.addToGrid
	* @description Adds a node instance to the node.grid
	* @param {object} nodeInstance - node instance to add to the grid
	*/
	Node.addToGrid = function(nodeObject) {
		if(typeof nodeObject === 'undefined')
			return;
		
		if(typeof Node.grid[nodeObject.gridX + '_' + nodeObject.gridY] === 'undefined')
			Node.grid[nodeObject.gridX + '_' + nodeObject.gridY] = nodeObject;
			
		return nodeObject;
	};
	
	Node.pathToTarget = function() {
		var currentNode;
		
		if(typeof Node.grid[Math.round(targetX) + '_' + Math.round(targetY)] === 'undefined')
			return;
			
		currentNode = Node.grid[Math.round(targetX) + '_' + Math.round(targetY)];
		currentNode.visited = true;
		
		while(currentNode !== startNode && typeof currentNode.origin !== 'undefined') {
			
			currentNode = currentNode.origin;
			currentNode.visited = true;
		}
	
	};
	
	Node.createNeighbors = function(nodeObject) {
		var dirs = [
			[0, -1], // up
			[1, 0], // right
			[0, 1],  // Down
			[-1, 0] // left
		];
		var arrows = [
			'V',
			'<',
			'^',
			'>'
		];
		var dirCurrent;
		var d = 0;
		var neighborsAdded = [];
		var nodeObjectNew;
		
		if(typeof nodeObject === 'undefined' || nodeObject.distance === range)
			return neighborsAdded;
		
		for(d = 0; d < dirs.length; d++) {
			dirCurrent = dirs[d];
			if(Node.testSpace(nodeObject.x+dirCurrent[0]*nodeSize, nodeObject.y+dirCurrent[1]*nodeSize, nodeObject.gridX+dirCurrent[0], nodeObject.gridY+dirCurrent[1])) {
				nodeObjectNew = Node.addToGrid({
					distance: nodeObject.distance+1,
					x: nodeObject.x+dirCurrent[0]*nodeSize,
					y: nodeObject.y+dirCurrent[1]*nodeSize,
					gridX: nodeObject.gridX+dirCurrent[0],
					gridY: nodeObject.gridY+dirCurrent[1],
					size: nodeSize,
					origin: nodeObject,
					arrow: arrows[d],
					visited: false
				});
				//nodeCallback(nodeObjectNew);
				nextNodes.push(nodeObjectNew);
				if(typeof nodeObjectNew !== 'undefined') {
					neighborsAdded.push(nodeObjectNew);
				}
			}
			nodeObjectNew = undefined;
		}
		return neighborsAdded;
		
	};
	
	
	// Generate grid from start position
	(function() {
		
		var nextNode;
		var nextNeighbors;
		var startNode = {
			x: x,
			y: y,
			gridX: Math.round(x/nodeSize),
			gridY: Math.round(y/nodeSize),
			size: nodeSize,
			distance: 0,
			origin: undefined,
			arrow: '*'
		};
		
		if(Node.testSpace(x, y, startNode.gridX, startNode.gridY)) {
			Node.addToGrid(startNode);
			Node.createNeighbors(startNode);
		
			while(nextNodes.length > 0) {
				nextNode = nextNodes.shift();
				Node.createNeighbors(nextNode);
				//console.log(nextNode.distance, range,  nextNodes.length, nextNeighbors.length);
				//nextNodes = nextNodes.concat(nextNeighbors);
			
			}
		}
		
	})();
	
	Node.pathToTarget();
	
	return Node.grid;
}