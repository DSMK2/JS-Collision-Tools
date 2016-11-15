function SpatialHash(cWidth, cHeight) {
	this.buckets = {};
	
	// Cell size
	this.cWidth = cWidth;
	this.cHeight = cHeight;

	// Grid size
	this.gWidth = 0;
	this.gHeight = 0;
}

SpatialHash.prototype = {
	clear: function() {
		// Let garbage collection do the work
		this.buckets = {};
	},
	/**
	* Inserts item into the hash map
	*/
	insert: function(item) {
		var x,
		y, 
		width,
		height,
		boundsX = {},
		boundsY = {},
		position = '',
		positions = [],
		i = 0,
		d = 0,
		found = false;
		
		if(typeof item === 'undefined')
			return false;
			
		// Must have a position
		if(typeof item.x !== 'number' || typeof item.y !== 'number')
			return false;
		
		x = item.x;
		y = item.y;
		width = typeof item.width !== 'number' ? 0 : item.width;
		height = typeof item.height !== 'number' ? 0 : item.height;

		// Find positions (bounds) based on bounds
		boundsX.high = Math.floor((x + width) / this.cWidth);
		boundsX.low = Math.floor((x - width) / this.cWidth);

		boundsY.high = Math.floor((y + height) / this.cHeight);
		boundsY.low = Math.floor((y - height) / this.cHeight);
		
		// Iterate over bounds for each position to handle large objects
		// Assign items to 'buckets'
		for(x = boundsX.low; x <= boundsX.high; x++) {
			for(y = boundsY.low; y <= boundsY.high; y++) {
				position = x + ' ' + y;				
				found = false;
			
				// Undefined positions are defined as arrays, new "buckets"
				if(typeof this.buckets[position] === 'undefined')
					this.buckets[position] = [];
			
				// Prevent Dupes
				for(d = 0; d < this.buckets[position].length; d++) {
				
					if(item === this.buckets[position][d]) {
						found = true;
						break;
					}	
				
				}
			
				// Add to position if item is not a dupe
				if(!found)
					this.buckets[position].push(item);
			}
		}
		
		return true;
	},
	/**
	* @function spatialHash.retrieve 
	* @description Retrieves items found within given arguments
	* @param {number} x X coordinate of area to check
	* @param {number} y Y coordinate of area to check
	* @param {number} width Width of area to check, checks half of width from x
	* @param {number} height Height of area to check, checks half of height from x
	* @returns {array} An array representing items found
	*/
	retrieve: function(x, y, width, height) {
		var 
		boundsX = {},
		boundsY = {},
		item,
		results = [],
		bucket,
		i = 0,
		d = 0,
		found = false;

		// Must have a position
		if(typeof x !== 'number' && typeof y !== 'number')
			return;
		
		width = typeof width !== 'number' ? 0 : width;
		height = typeof height !== 'number' ? 0 : height;
		
		// Get cell position based on position and bounds
		boundsX.high = Math.floor((x + width/2) / this.cWidth);
		boundsX.low = Math.floor((x - width/2) / this.cWidth);

		boundsY.high = Math.floor((y + height/2) / this.cHeight);
		boundsY.low = Math.floor((y - height/2) / this.cHeight);
		
		// Look for buckets with positions found within bounds
		for(x = boundsX.low; x <= boundsX.high; x++) {
			for(y = boundsY.low; y <= boundsY.high; y++) {
				bucket = this.buckets[x + ' ' + y];
				
				// Push items in bucket to results, while skipping over dupes
				if(typeof bucket !== 'undefined' && bucket.length !== 0) {
					
					// Push all items in position into results
					for(i = 0; i < bucket.length; i++) {
						item = bucket[i];
						found = false;
						
						// Do not allow dupes
						for(d = 0; d < results.length; d++) {
							if(item === results[d]) {
								found = true;
								break;
							}
						}
						
						if(!found)
							results.push(item);
					}
					
					
				}	
			}
		}

		return results;
	}
};