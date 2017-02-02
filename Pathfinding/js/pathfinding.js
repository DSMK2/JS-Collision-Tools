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
	var targetX;
	var targetY;
	var currentGridX = 0;
	var currentGridY = 0;
	var startNode;
	var nextNodes = [];
	var needsExit = false;
	var costSoFar = 0;
	
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
			cost: distance from starting position (gridwise) with added weights
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
	* @returns {boolean} - True if node has available space, false otherwise
	*/
	Node.testSpace = function (x, y, gridX, gridY) {
		var result = false;
		
		if(typeof Node.grid[gridX + '_' + gridY] === 'undefined')
			result = true;

		if(result) {
			if(typeof nodeTest === 'function')
				result = nodeTest(x, y, nodeSize);
		}
		
		// Reaching target triggers early exit
		if(gridX === Math.round(targetX) && gridY === Math.round(targetY))
			needsExit = true;
		
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
		var dirs = [
			[0, -1], // up
			[1, 0], // right
			[0, 1],  // Down
			[-1, 0]	// left
		];
		var d = 0;
		var tempNextGridX;
		var tempNextGridY;
		var nextGrid;
		var nextNode;
		var minCost;
		
		
		if(typeof Node.grid[Math.round(targetX) + '_' + Math.round(targetY)] === 'undefined')
			return;
		
		currentGridX = Math.round(targetX);
		currentGridY = Math.round(targetY);
		
		currentNode = Node.grid[currentGridX + '_' + currentGridY];
		currentNode.visited = true;
		costSoFar += currentNode.cost;
		
		while(currentNode !== startNode && typeof currentNode.origin !== 'undefined') {
			
			for(var d = 0; d < dirs.length; d++) {
				tempNextGridX = currentGridX+dirs[d][0];
				tempNextGridY = currentGridY+dirs[d][1];
				nextGrid = tempNextGridX + '_' + tempNextGridY;
				
				/* Pick next node based on distance */
				if(typeof Node.grid[nextGrid] !== 'undefined') {
					if(typeof minCost === 'undefined' || minCost > Node.grid[nextGrid].cost) {
						minCost = Node.grid[nextGrid].cost;
						nextNode = Node.grid[nextGrid];
						nextGridX = tempNextGridX;
						nextGridY = tempNextGridY;
					}
				}
			}
			
			if(typeof nextNode !== 'undefined') {
				currentNode = nextNode;
				currentNode.visited = true;
				costSoFar += minCost;
				currentGridX = nextGridX;
				currentGridY = nextGridY;
			} else
				break;
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
		var xNext;
		var	yNext;
		var gridXNext;
		var gridYNext;
		var testSpaceValue;
		
		if(typeof nodeObject === 'undefined' || nodeObject.cost === range)
			return;
		
		if((nodeObject.gridX + nodeObject.gridY) % 2 === 0) {
			dirs.reverse();
			arrows.reverse();
		}
		
		for(d = 0; d < dirs.length; d++) {
			// Early Exit
			if(needsExit)
				break;
		
		
			dirCurrent = dirs[d];
			xNext = nodeObject.x+dirCurrent[0]*nodeSize;
			yNext = nodeObject.y+dirCurrent[1]*nodeSize;
			gridXNext = nodeObject.gridX+dirCurrent[0];
			gridYNext = nodeObject.gridY+dirCurrent[1];
			
			testSpaceValue = Node.testSpace(xNext, yNext, gridXNext, gridYNext);
			
			if(testSpaceValue) {
				nodeObjectNew = Node.addToGrid({
					cost: nodeObject.cost + (typeof testSpaceValue === 'number' ? testSpaceValue : 1),
					costOffset: typeof testSpaceValue === 'number' ? testSpaceValue : 0,
					x: xNext,
					y: yNext,
					gridX: gridXNext,
					gridY: gridYNext,
					size: nodeSize,
					origin: nodeObject,
					arrow: arrows[d],
					visited: false
				});
				
				if(typeof nodeObjectNew !== 'undefined') {
					nextNodes.push(nodeObjectNew);
				}
			}
			nodeObjectNew = undefined;
		}
		
	};
	
	
	// Generate grid from start position
	(function() {
		
		var nextNode;
		var startNode = {
			x: x,
			y: y,
			gridX: Math.round(x/nodeSize),
			gridY: Math.round(y/nodeSize),
			size: nodeSize,
			cost: 0,
			costOffset: 0,
			origin: undefined,
			arrow: '*'
		};
		
		if(Node.testSpace(x, y, startNode.gridX, startNode.gridY)) {
			Node.addToGrid(startNode);
			Node.createNeighbors(startNode);
		
			while(nextNodes.length > 0 && !needsExit) {
			
				nextNode = nextNodes.shift();
				Node.createNeighbors(nextNode);
			
			}
		}
		
	})();
	
	Node.pathToTarget();
	
	return Node.grid;
}