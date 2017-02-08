function SpatialHash(cWidth, cHeight) {
	this.buckets = {};
	
	// Cell size
	this.cWidth = cWidth;
	this.cHeight = cHeight;

	// Grid size
	this.gWidth = 0;
	this.gHeight = 0;
}

SpatialHash.numItems = 0;

SpatialHash.prototype = {
	clear: function() {
		// Let garbage collection do the work
		this.buckets = {};
		SpatialHash.numItems = 0;
	},
	/**
	* Inserts item into the hash map
	*/
	insert: function(x, y, width, height, item) {
		var
		width,
		height,
		boundsX = {},
		boundsY = {},
		position = '',
		positions = [],
		i = 0,
		d = 0,
		itemNode = {},
		bucket;
			
		// Must have a position
		if(typeof x !== 'number' || typeof y !== 'number')
			return false;
		
		// Size is optional
		width = typeof width !== 'number' ? 0 : width;
		height = typeof height !== 'number' ? 0 : height;
		
		// Generate 
		itemNode = {item: item, id: SpatialHash.numItems};	
			
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
			
				// Undefined positions are defined as objects, new "buckets"
				if(typeof this.buckets[position] === 'undefined')
					this.buckets[position] = {};
				
				bucket = this.buckets[position];
				
				// Push item in if slot with ID doesn't exist
				if(typeof bucket[SpatialHash.numItems] === 'undefined')
					bucket[SpatialHash.numItems] = itemNode;
			}
		}
		
		SpatialHash.numItems++;
		
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
		found = false,
		itemID,
		itemChecklist = {};

		// Must have a position
		if(typeof x !== 'number' && typeof y !== 'number')
			return results;
		
		width = typeof width !== 'number' ? 0 : width;
		height = typeof height !== 'number' ? 0 : height;
		
		// Get cell bounds based on position and bounds
		boundsX.high = Math.floor((x + width/2) / this.cWidth);
		boundsX.low = Math.floor((x - width/2) / this.cWidth);

		boundsY.high = Math.floor((y + height/2) / this.cHeight);
		boundsY.low = Math.floor((y - height/2) / this.cHeight);
		
		// Look for buckets with positions found within bounds
		for(x = boundsX.low; x <= boundsX.high; x++) {
			for(y = boundsY.low; y <= boundsY.high; y++) {
				bucket = this.buckets[x + ' ' + y];
				
				// Push items in bucket to results, while skipping over dupes
				if(typeof bucket !== 'undefined') {
					
					// Push all items in position into results
					for(itemID in bucket) {
						if(!bucket.hasOwnProperty(itemID))
							continue;
							
						item = bucket[itemID];
						
						// Add item id to checklist and results if it doesn't exist
						if(typeof itemChecklist[item.id] === 'undefined') {
							itemChecklist[item.id] = true;
							results.push(item.item);
						}
						
					}
				}	
			}
		}

		return results;
	}
};