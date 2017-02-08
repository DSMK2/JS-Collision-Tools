function AABB(rectA, rectB) {
	// Check if required values exist for both rectA and rectB
	function validRect(rect) {
	
		if(typeof rect.x === 'number' && typeof rect.y === 'number' && typeof rect.width === 'number' && typeof rect.height === 'number')
			return true;
		
		return false;
	}
	
	if(!validRect(rectA && rectB))
		return;

	if(rectA.x - rectA.width/2 < rectB.x + rectB.width/2 
	&& rectA.x + rectA.width/2 > rectB.x - rectB.width/2 
	&& rectA.y - rectA.height/2 < rectB.y + rectB.height/2
	&& rectA.height/2 + rectA.y > rectB.y-rectB.height/2)
		return true;

	return false;
}