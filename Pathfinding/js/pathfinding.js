// Provide a destination, create a grid from that destination I guess
// Should be used with some sort of broad phase collision checking via callback
// See http://www.redblobgames.com/pathfinding/a-star/introduction.html
// Todo: Implement Heap structure + Priority Queue
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
	var nextNodes; // = new PriorityQueue({isMin: true});
	var needsExit = false;
	var costSoFar = 0;
	
	/**
	* @function extend 
	* @description Returns an object that has 'default' values overwritten by 'options', otherwise default values. Properties not found in defaults are skipped.
	* @param {object} defaults - Object with the default values
	* @param {object} options - Object with values
	* @returns {object} - Object that has 'default' values overwritten by 'options', otherwise default values.
	*/
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
	
	/**
	* @function getDistance 
	* @description Returns the Manhattan distance between two grid coordinates 
	* @param {object} a - Object containing x, y grid values
	* @param {object} b - Object containing x, y grid values
	* @return {number} - Manhattan distance between two grid coordinates
	*/
	function getDistance(a, b) {
		return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
	}

	/**
	* @function PriorityQueue 
	* @description A priority queue implementation where elements are ordered based on whether the queue is set to be a min/max queue
	* @param {...Array} var_args - Array of starting elements, they will be prioritized based on index value
	* @param {...boolean} var_args - Whether this is a min (true) or a max array (false/default);
	* @see http://pages.cs.wisc.edu/~vernon/cs367/notes/11.PRIORITY-Q.html
	*/
	function PriorityQueue() {
		var i = 0;
		var arguementProperty;
		var argument;
		var startingElements = [];
		var isMin;
				
		for(arguementProperty in arguments) {
			if(arguments.hasOwnProperty(arguementProperty)) {
				argument = arguments[arguementProperty];
			
				if(typeof argument === 'object' && argument instanceof Array)
						startingElements = argument;
				
				if(typeof argument === 'boolean')
					isMin = argument;
			}
		}

		options = extend(defaults, options);
	
		this.queueArray = ['']; // Empty element so root is one
		this.isMin = isMin;
	
		// Automatically assign priority based on index
		for(i = 0; i < startingElements.length; i++) {
			this.insert(startingElements[i], startingElements.length-1-i);
		}
	
		return this;
	}

	PriorityQueue.prototype = {
		/**
		* @function PriorityQueue.prototype.swap
		* @description Swaps value at destination with value at target
		* @param {number} target - Target index to swap from
		* @param {number} destination - Target index to swap to
		*/
		swap: function (target, destination) {
			var temp;
		
			if(ypeof this.queueArray[destination] !== 'number' || typeof this.queueArray[target] !== 'number' || target >= this.queueArray.length || destination >= this.queueArray.length)
				return;
				
			temp = this.queueArray[destination];
			this.queueArray[destination] = this.queueArray[target];
			this.queueArray[target] = temp;
		},
		/**
		* @function PriorityQueue.prototype.queueHelper 
		* @description Traverses up a the priority queue from an index, until the priority of the value at index doesn't satisfy min/max priority queue conditions
		* @param {number} index - Index to traverse the priority queue upwards from
		*/
		queueHelper: function(index) {
			var parentIndex = ~~(index/2);
		
			if(index == 1 || parentIndex <= 1 || index > this.queueArray.length || parentIndex > this.queueArray.length)
				return;
		
			if(this.isMin ? this.queueArray[parentIndex].priority > this.queueArray[index].priority : this.queueArray[parentIndex].priority < this.queueArray[index].priority)
				this.swap(index, parentIndex);
			else // Do nothing if priority is equal
				return; 
			
			// Run until at root (index 1) node	
			this.queueHelper(parentIndex);
		},
		queue: function (value, priority) {
			this.queueArray.push({value: value, priority: priority});
			this.queueHelper(this.queueArray.length-1);
		},
		dequeueHelper: function(index) {
			var leftIndex;
			var rightIndex;
			var leftElement;
			var rightElement;
		
			if(typeof index === 'undefined')
				index = 1;
			
			leftIndex = index * 2;
			rightIndex = index * 2 + 1;
				
			if (leftIndex < this.queueArray.length && typeof this.queueArray[leftIndex] !== 'undefined') {
				if(this.isMin ? this.queueArray[leftIndex].priority < this.queueArray[index].priority : this.queueArray[leftIndex].priority > this.queueArray[index].priority)
					leftElement = this.queueArray[leftIndex];
			} 
		
			if (rightIndex < this.queueArray.length && typeof this.queueArray[rightIndex] !== 'undefined') {
				if(this.isMin ? this.queueArray[rightIndex].priority < this.queueArray[index].priority : this.queueArray[rightIndex].priority > this.queueArray[index].priority)
					rightElement = this.queueArray[rightIndex];
			}
				
			// Run until there are no more left/right leafs
			if(typeof leftElement  === 'undefined' && typeof rightElement === 'undefined')
				return;
		
			// If one or the other is undefined, use the one that has value		
			if(typeof leftElement === 'undefined' && typeof rightElement !== 'undefined') {
					this.swap(leftIndex, index);
					this.dequeueHelper(leftIndex);
			}
			else if(typeof leftElement !== 'undefined' && typeof rightElement === 'undefined') {
				this.swap(rightIndex, index);
				this.dequeueHelper(rightIndex);
			// If both are defined, use value based on priority 
			} else {		
				if(this.isMin) {
			
					if (leftElement.priority < rightElement.priority) {
						this.swap(leftIndex, index);
						this.dequeueHelper(leftIndex);
					} else if (leftElement.priority >= rightElement.priority) {
						this.swap(rightIndex, index);
						this.dequeueHelper(rightIndex);
					}
				} else {
					if (leftElement.priority > rightElement.priority) {
						this.swap(leftIndex, index);
						this.dequeueHelper(leftIndex);
					} else if (leftElement.priority <= rightElement.priority) {
						this.swap(rightIndex, index);
						this.dequeueHelper(rightIndex);
					}
				}
			}
		},
		dequeue: function() {
			var result;
		
			if(this.queueArray.length === 0)
				return;
		
			this.swap(1, this.queueArray.length-1);
			result = this.queueArray.splice(this.queueArray.length-1);
			this.dequeueHelper();
		
			if(result.length !== 0) {
				return result[0].value;
			} else
				return;
		},
		isEmpty: function() {
			return this.queueArray.length === 0;
		}
	
	};
	
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
	nextNodes = new PriorityQueue(true);
	
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
	* @function Node.testSpace
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
				result = nodeTest(x, y, gridX, gridY, nodeSize);
		}
		
		// Reaching target triggers early exit
		if(gridX === Math.round(targetX) && gridY === Math.round(targetY))
			needsExit = true;
		
		return result;
		
	};
	
	/**
	* @function Node.addToGrid
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
	
	/**
	* @function Node.pathToTarget
	*/
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
		var nextGridX;
		var nextGridY;
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
			
			for(d = 0; d < dirs.length; d++) {
				tempNextGridX = currentGridX+dirs[d][0];
				tempNextGridY = currentGridY+dirs[d][1];
				nextGrid = tempNextGridX + '_' + tempNextGridY;
				
				
				/* Pick next node based on distance */
				if(typeof Node.grid[nextGrid] !== 'undefined') {
					if((typeof minCost === 'undefined' && typeof minDistance === 'undefined') || minCost >= Node.grid[nextGrid].cost) {
						
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
		var nodeObjectNew;
		var xNext;
		var	yNext;
		var gridXNext;
		var gridYNext;
		var testSpaceValue;
		
		if(typeof nodeObject === 'undefined' || nodeObject.cost >= range)
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
			
			// Skip spaces that cost beyond range
			if(testSpaceValue + nodeObject.cost >= range)
				continue;
			
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
					nextNodes.queue(
						nodeObjectNew, 
						getDistance({x: Math.round(targetX), y: Math.round(targetY)}, 
						{x: gridXNext, y: gridYNext}
					));
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
		
			while(!nextNodes.isEmpty() && !needsExit) {
			
				nextNode = nextNodes.dequeue();
				Node.createNeighbors(nextNode);
			
			}
		}
		
	})();
	
	Node.pathToTarget();
	
	return Node.grid;
}