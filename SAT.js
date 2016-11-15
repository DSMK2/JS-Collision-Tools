function SATTest (polygonA, polygonB) {
	var 
	axis,
	axesA = [],
	axesB = [],
	i = 0,
	projectionA,
	projectionB;
	
	/* I would've written a proper vector math library here but I would like SATTest to be self standing */
	function vectorSubtract(vectorA, vectorB) {
		return {
			x: vectorA.x-vectorB.x, 
			y: vectorA.y-vectorB.y
		};
	}

	function vectorPerpendicular(vector) {
		return {x: -vector.x, y: vector.y};
	}

	function vectorNormalize(vector) {
		var length = Math.sqrt(Math.pow(vector.x, 2) + Math.pow(vector.y, 2));
		return {x: vector.x / length, vector.y / length};
	}
	
	function vectorDot(vectorA, vectorB) {
		return (vectorA.x * vectorB.x) + (vectorA.y * vectorB.y);
	}
	
	function getAxes(polygon) {
		var axes = [],
		vertices = polygon.vertices,
		vertexA,
		vertexB,
		i = 0;
		
		for (i = 0; i < vertices.length; i++) {
			vertexA = vertices[i];
			vertexB = vertices[i + 1 == vertices.length ? 0 : i + 1];
			
			axes.push(vectorNormalize(vectorPerpendicular(vectorSubtract(vertexA, vertexB))));
			 
		}
		
		return axes;
	}
	
	function getProjection(polygon, axis) {
		var vertices = polygon.vertices
		dot,
		min,
		max,
		i = 0;
		
		for(i = 0; i < vertices.length; i++) {
			dot = vectorDot(axis, vertices[i]);
			
			if(typeof min === 'undefined' && typeof max === 'undefined') {
				min = dot;
				max = dot;
			}
			else {
				if(dot > max)
					max = dot;
				else if(dot < min)
					min = dot;
			}
			
		}
		
		return {max: max, min: min};
		
	}
	
	function checkProjection(projectionA, projectionB) {
		if(projectionA.min > projectionB.max)
	}
	
	axesA = getAxes(polygonA);
	axesB = getAxis(polygonB);
	
	// Loop through axes from polygonA
	for (i = 0; i < axesA.length; i++) {
		axis = axesA[i];
		projectionA = getProjection(polygonA, axis);
		projectionB = getProjection(polygonB, axis);
	}
	
	// Loop through axes from polygonB
	for (i = 0; i < axesB.length; i++) {
	}
	
}