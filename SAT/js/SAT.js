/**
* @see http://www.dyn4j.org/2010/01/sat/
*/
function SATTest (polygonA, polygonB) {
	var 
	axis,
	axes = [],
	i = 0,
	projectionA,
	projectionB,
	vectorMath = {
		subtract: function (vectorA, vectorB) {
			return {
				x: vectorA.x - vectorB.x, 
				y: vectorA.y - vectorB.y
			};
		},
		perpendicular: function (vector) {
			return {
				x: vector.y, 
				y: -vector.x
			};
		},
		normalize: function (vector) {
			var length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
			return {x: 
				vector.x / length, 
				y: vector.y / length
			};
		},
		dot: function (vectorA, vectorB) {
			return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
		},
		cross: function(vectorA, vectorB) {
			return (vectorA.x * vectorB.y) - (vectorA.y * vectorB.x);
		}
	};
	
	/**
	* @function getAxes
	* @description Gets all axes in a given polygon
	* @param {object} polygon Polygon to get axes from
	* 	@param {number} polygon.vertices An array of objects with x and y parameters that represent vertices that make up the polygon
	* @returns {array} An array of axes for the given polygon
	*/
	function getAxes(polygon) {
		var axes = [],
		vertices = polygon.vertices,
		vertexA,
		vertexB,
		i = 0;
		
		// Get axis for each edge in the polygon (order of vertices do matter!)
		for (i = 0; i < vertices.length; i++) {
		
			vertexA = vertices[i];
			vertexB = vertices[i + 1 == vertices.length ? 0 : i + 1];
			
			// Get the edge vector
			// Get the normal of the edge vector
			// Normalize the normal
			axes.push(vectorMath.normalize(vectorMath.perpendicular(vectorMath.subtract(vertexA, vertexB))));
			 
		}
		
		return axes;
	}
	
	/** 
	* @function getProjection 
	* @description Gets the projection of a polygon upon a given axis
	* @param {object} polygon Polygon to project
	* 	@param {number} polygon.vertices An array of objects with x and y parameters that represent vertices that make up the polygon
	* @param {object} axis Axis to project upon
	* 	@param {number} axis.x X coordinate of the axis vector
	*	@param {number} axis.y Y coordinate of the axis vector
	* @returns {object} object that represents the min and max values of the polygon projected on a given axis
	*/
	function getProjection(polygon, axis) {
		var vertices = polygon.vertices,
		dot,
		min,
		max,
		i = 0;
		
		for(i = 0; i < vertices.length; i++) {

			dot = vectorMath.dot(axis, vertices[i]);
			
			if(typeof min === 'undefined' && typeof max === 'undefined') {
				min = dot;
				max = dot;
			} else if(dot < min)
				min = dot;
			else if(dot > max)
				max = dot;
			
		}
		
		return {min: min, max: max};
		
	}
	
	/**
	* @function checkProjectionOverlap 
	* @description Checks for overlap between two projections
	* @param {object} projectionA
	* 	@param {number} projectionA.min Min value of projection
	* 	@param {number} projectionA.max Max value of projection
	* @param {object} projectionB
	* 	@param {number} projectionB.min Min value of projection
	* 	@param {number} projectionB.max Max value of projection
	* @returns {boolean} true if overlap, false otherwise
	*/
	function checkProjectionOverlap(projectionA, projectionB) {
		
		// After projection B or before projection B
		if(projectionA.min > projectionB.max || projectionA.max < projectionB.min)
			return false;
		
		// Projections are within each other
		return true;
		
	}

	// Get all axes from both polygons
	axes = getAxes(polygonA).concat(getAxes(polygonB));
		
	// Loop through all axes
	for (i = 0; i < axes.length; i++) {
		axis = axes[i];
		projectionA = getProjection(polygonA, axis);
		projectionB = getProjection(polygonB, axis);
				
		if(!checkProjectionOverlap(projectionA, projectionB))
			return false;
	}
		
	return true;
	
}