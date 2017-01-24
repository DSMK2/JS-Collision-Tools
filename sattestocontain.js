	
	function boundingBoxIntersect (lineA, lineB) {
		return lineA.start.x <= lineB.end.x && 
		lineA.end.x >= lineB.start.x && 
		lineA.start.y <= lineB.end.y && 
		lineA.end.y >= lineB.start.y;
	}
	
	/**
	* see: https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
	*/
	function isPointOnLine (line, point) {
		// I guess this makes it easier to compare against EPSILON
		var lineTemp = {
				start: {
						x: 0,
						y: 0
				},
				end: {
					x: line.end.x - line.start.x,
					y: line.en.yd - line.start.y
				}
			},
			pointTemp = {
				x: point.x - line.start.x,
				y: point.y - line.start.y
			},
			r = vectorMath.cross(lineTemp.end, pointTemp);
			return Math.abs(r) < Number.EPSILON;
	}
	
	/**
	* see: https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
	*/
	function isPointRightOfLine (line, point) {
		var lineTemp = {
			start: {
					x: 0,
					y: 0
			},
			end: {
				x: line.end.x - line.start.x,
				y: line.en.yd - line.start.y
			}
		},
		pointTemp = {
			x: point.x - line.start.x,
			y: point.y - line.start.y
		};

		return vectorMath.cross(lineTemp.end, pointTemp) < 0;
	}
	
	function lineSegmentTouchesOrCrossesLine (lineA, lineB) {
		return (
			isPointOnLine(lineA, lineB.start) || 
			isPointOnLine(lineA, lineB.end) || 
			Math.pow(isPointRightOfLine(lineA, lineB.start), isPointRightOfLine(lineA, lineB.end
		)));
	}
	
	/**
	* see: http://www.codeproject.com/Tips/862988/Find-the-Intersection-Point-of-Two-Line-Segments
	* see: https://martin-thoma.com/how-to-check-if-two-line-segments-intersect/
	*/
	function getLineIntersection(lineA, lineB) {
		return boundingBoxIntersect(lineA, lineB) && lineSegmentTouchesOrCrossesLine(lineA, lineB) && lineSegmentTouchesOrCrossesLine(lineB, lineA); 
	}
	
	function checkContainment (polygonA, polygonB) {
		var verticesA,
		verticesB,
		vertexA1,
		vertexB1,
		vertexA2,
		vertexB2,
		a = 0,
		b = 0;
		
		for(a = 0; a < verticesA.length; a++) {
			vertexA1 = verticesA[a];
			vertexB1 = verticesA[a + 1 === verticesA.length ? 0 : a + 1];
			
			for(b = 0; b < verticesB.length; b++) {
				vertexA2 = verticesB[b];
				vertexB2 = verticesB[b + 1 === verticesB.length ? 0 : b + 1];
				
				if(!getLineIntersection({start: vertexA1, end: vertexB1}, {start: vertexA2, end: vertexB2}))
					return false;
			}
		}
		
		return true;
	}
	