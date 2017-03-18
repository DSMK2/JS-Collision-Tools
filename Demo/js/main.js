window.range = 50;
window.onload = function() {
	var mousePosition = {x: 0, y: 0};
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var fps = 60;
	var points;
	var player;
	
	var enemyMin = 10;
	
	var spatialHash = new SpatialHash(30, 30);
	
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
	* @function drawWithRotation
	* @description Helper function draw elements with a given angle of rotation
	* @param {object} context - Context to work with
	* @param {number} x - X origin to rotate
	* @param {number} y - Y origin to rotate
	* @param {number} rotation - Rotation in degrees to rotate
	* @param {function} callback - Function that draws something
	*/
	function drawWithRotation(context, x, y, rotation, callback) {
			
			context.translate(x, y);
			context.rotate(rotation * Math.PI / 180);
			
			callback(context);
			
			context.rotate(-(rotation * Math.PI / 180));
			context.translate(-x, -y);
			
	}
	
	/**
	* @function getAngleToPosition
	* @description Returns angle between coordinates
	* @param {number} x1 - X coordinate of from position
	* @param {number} y1 - Y coordinate of from position
	* @param {number} x2 - X coordinate of to position
	* @param {number} y2 - Y coordinate of to position
	* @returns {number} - Angle in radians 
	*/
	function getAngleToPosition (x1, y1, x2, y2)
	{
		var angle = -1;
		var x = x2 - x1;
		var y = y2 - y1;
		
		angle = Math.atan2(y, x);
		
		angle = angle < 0 ? angle+(2*Math.PI) : angle;
		
		return angle;
	}
	
	/**
	* @function getShortestAngle
	* @description Returns the shortest angle from angleFrom to angleTo
	* @param {number} angleFrom - Origin angle in radians
	* @param {number} angleTo - Destination angle in radians
	* returns {number} - Angle in radians
	*/
	function getShortestAngle(angleFrom, angleTo) {
		var dir;
		var angleDelta;
		
		angleFrom*=Math.PI/180;
		angleTo*=Math.PI/180;
		
		// Get direction rotation is going to happen
		dir = Math.cos(angleFrom)*Math.sin(angleTo)-Math.sin(angleFrom)*Math.cos(angleTo) > 0 ? 1 : -1;
		
		// Offset angle target to match direction i.e. if the direction is possitive and the current angle is 360, the destination is 360 plus
		angleTo = dir > 0 && angleTo < angleFrom ? angleTo+=2*Math.PI : angleTo;
		
		// Find amount of rotation
		angleDelta = angleTo-angleFrom;
		
		// Find shortest angle to rotate to 
		while(angleDelta < -Math.PI) { angleDelta += 360*Math.PI/180; }
		while(angleDelta > Math.PI) { angleDelta -= 360*Math.PI/180; }
		
		return angleDelta;
		
	}
	
	/**
	* @function getPolygonAABB
	* @description Find's a polygon's axis aligned bounding box (AABB)
	* @param {Array} polygon - An array of objects with x/y properties that make up a polygon
	* @returns {object} - width/height dimensions of a given polygon's AABB
	*/
	function getPolygonAABB(polygon) {
		var minX = polygon[0].x;
		var maxX = polygon[0].x;
		var minY = polygon[0].y;
		var maxY = polygon[0].y;
		var width;
		var height;
		
		var p = 1;
		var point;
		
		for(p; p < polygon.length; p++) {
			point = polygon[p];
			
			minX = Math.min(minX, point.x);
			maxX = Math.max(maxX, point.x);
			
			minY = Math.min(minY, point.y);
			maxY = Math.max(maxY, point.y);
		}

		width = Math.abs(maxX - minX);
		height = Math.abs(maxY - minY);
		
		return {width: width, height: height};
	}
	
	// A helper function that transform an array of vertex objects into integer pairs
	function flattenPolygon(polygon) {
		var p = 0;
		var result = [];
		
		for(p; p < polygon.length; p++) {
			result.push(polygon[p].x, polygon[p].y);
		}
		
		
		return result; 
	}
	
	// This allows concave shapes!
	function triangulatePolygon(polygon) {
		var triangleIndicies = earcut(flattenPolygon(polygon));
		var triangle = [];
		var triangulatedPolygon = [];
		var t;
		
		for(t = 0; t < triangleIndicies.length; t++) {
			triangle.push(polygon[triangleIndicies[t]]);
			
			if((t+1) % 3 === 0) {
				triangulatedPolygon.push(triangle);
				triangle = [];
			}
		}
		
		return triangulatedPolygon;
	}
	
	// This should be a class
	// Gets the polygon's area, needs a triangulated polygon to work
	// See: http://www.wikihow.com/Calculate-the-Area-of-a-Polygon
	function getPolygonArea(triangulatedPolygon) {
		var p = 0; 
		var triangle;
		var area;
		var a;
		var b; 
		var c;
		
		for(p; p < triangulatedPolygon.length; p++) {
			triangle = triangulatedPolygon[p];
			a = triangle[0];
			b = triangle[1];
			c = triangle[2];
			
			area += (a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y))/2
			
		}
	
		return area
	}
	
	/**
	* @function getPolygonCentroid
	* @param {Array} polygon - An array of objects with x/y properties that make up a polygon
	* @returns {object} - Polygon centroid created from the average of X and Y coordinates
	* @see: http://mathcentral.uregina.ca/qq/database/qq.09.07/h/david7.html (Not wrong, but may not be what I am looking for)
	* @see: http://math.stackexchange.com/questions/3177/why-doesnt-a-simple-mean-give-the-position-of-a-centroid-in-a-polygon
	* @see: http://math.stackexchange.com/questions/90463/how-can-i-calculate-the-centroid-of-polygon
	* @todo: Triangulate polygon then calculate centroid from resulting triangles
	*/
	function getPolygonCentroid(triangulatedPolygon) {
		var p = 0;
		var point;
		var sumX = 0;
		var sumY = 0;
		var triangleIndicies = earcut(flattenPolygon(triangulatedPolygon));
		var triangle = [];
		var triangles = [];
		var triangleArea;
		var triangleCentroid;
		var totalTriangleCentroid = {x: 0, y: 0};
		var weightedCentroid;
		var totalArea = 0;
		var t = 0;
		var a;
		var b; 
		var c;

		for(t; t < triangulatedPolygon.length; t++) {
			triangle = triangulatedPolygon[t];
			a = triangle[0];
			b = triangle[1];
			c = triangle[2];
			
			triangleArea = (a.x*(b.y-c.y)+b.x*(c.y-a.y)+c.x*(a.y-b.y))/2
			triangleCentroid = {x: (a.x+b.x+c.x)/3, y: (a.y+b.y+c.y)/3};
			
			weightedCentroid = {x: triangleArea*triangleCentroid.x, y: triangleArea*triangleCentroid.y};
			totalTriangleCentroid.x += weightedCentroid.x;
			totalTriangleCentroid.y += weightedCentroid.y;
			
			totalArea += triangleArea;
		}
		
		return {x: totalTriangleCentroid.x/totalArea, y: totalTriangleCentroid.y/totalArea};
	}
	
	// BEGIN: Projectile
	function Projectile(options) {
		var defaults = {
			polygon: [
				{x: 15, y: 0},
				{x: -10, y: -10},
				{x: -10, y: 10},
			],
			position: {x: 0, y: 0},
			velocity: {x: 0, y: 0},
			rotation: 0,
			lifetime: 1500		// Milliseconds to live
		};
		
		options = extend(defaults, options);
		
		this.polygon = options.polygon;
		this.position = options.position;
		this.velocity = options.velocity;
		this.rotation = options.rotation;
		
		// Lifetime and Memory handling
		this.endTime = (new Date()).getTime() + options.lifetime;
		this.GUID = uuid.v4();
		this.needsDelete = false;
		
		// Unsure if duplicates need to be checked
		Projectile.projectiles[this.GUID] = this;
		Projectile.count++;
		
		return this;
	}
	
	// Run after updating projectiles
	Projectile.clean = function() {
		var projectileID;
		
		if(Projectile.count === 0)
			return;
		
		while(Projectile.projectilesToDelete.length !== 0) {
			
			projectileID = Projectile.projectilesToDelete.shift();
			
			if(Projectile.projectiles.hasOwnProperty(projectileID)) {
				Projectile.count--;
				delete Projectile.projectiles[projectileID]
			}
		}
	};
	
	Projectile.projectilesToDelete = [];
	Projectile.projectiles = {};
	Projectile.count = 0;
	
	Projectile.prototype = {
		update: function() {
			
			if(this.needsDelete)
				return;
			
			if((new Date()).getTime() >= this.endTime) {
				Projectile.projectilesToDelete.push(this.GUID);
				this.needsDelete = true;
				return;
			} 
		
			this.position.x += this.velocity.x;
			this.position.y += this.velocity.y;
			
			
		},
		redraw: function() {
			var _this = this;
			
			if(this.needsDelete)
				return;
			
			drawWithRotation(context, this.position.x, this.position.y, this.rotation, function(context) {
				var i = 1;
				var point;
				
				
				context.moveTo(_this.polygon[0].x, _this.polygon[0].y); 
				
				for(i = 1; i < _this.polygon.length; i++) {
					point = _this.polygon[i];
					context.lineTo(point.x, point.y);		
				}
				
				context.lineTo(_this.polygon[0].x, _this.polygon[0].y); 
				
				context.fillStyle = "#f00";
				context.fill();
				context.stroke();
			
			});
			
		}
	}
	// END: Projectile
	
	// BEGIN: Player
	function Player(options) {
		var defaults = {
			hp: 100,
			rotation: 0,
			position: {x: 0, y: 0}
		};
		
		options = extend(defaults, options);
		
		this.hp = options.hp;
		this.rotation = options.rotation;
		this.position = options.position;
	}
	
	Player.prototype = {
		redraw: function() {
				
			drawWithRotation(context, this.position.x, this.position.y, this.rotation, function(context) {
				context.rect(-50/2, -20/2, 50, 20);
				context.fillStyle = '#000';
				context.fill();
			});
			
		},
		setRotation: function(degrees) {
			this.rotation = degrees;
		},
		fire: function() {
			console.log(this.rotation);
			new Projectile({
				position: extend(this.position, {}),
				velocity: {x: 5*Math.cos(this.rotation*Math.PI/180), y: 5*Math.sin(this.rotation*Math.PI/180)},
				rotation: this.rotation
			});
		}
	}
	// END: Player
	
	// BEGIN: Enemy 
	function Enemy(options) {
	
		var defaults = {
			hp: 1,
			rotation: 0,
			position: {x: 0, y: 0},
			polygon: [
				{x: -15, y: -15},
				{x: 15, y: -15},
				{x: 30, y: 0},
				{x: 15, y: 15},
				{x: -15, y: 15}
			]
		}
		
		options = extend(defaults, options);
		
		this.hp = options.hp;
		this.rotation = options.rotation;
		this.position = options.position;
		this.polygon = options.polygon;
		this.pathToPlayer;
		
		this.aabb = getPolygonAABB(this.polygon);
		
		this.triangulatedPolygon = triangulatePolygon(this.polygon);
		this.polygonCenter = getPolygonCentroid(this.triangulatedPolygon);
		console.log(this.polygonCenter);
		
		this.needsDelete = false;
		this.GUID = uuid.v4();
		
		Enemy.enemies[this.GUID] = this;
		Enemy.count++;
		
		this.path;
		return this;
	}
	
	Enemy.enemies = {};
	Enemy.count = 0;
	
	Enemy.prototype = {
		update: function(){
			var path
			// Get path
			// Move along path
			// Rinse, repeat per update
		},
		redraw: function(){
			var _this = this;
			
			drawWithRotation(context, this.position.x, this.position.y, this.rotation, function() {
				var v = 1;
				var t = 0;
				var point;
				var triangle;
				
				// Yes actual polygon centers are a thing :d
				context.beginPath();
				context.rect(-_this.aabb.width/2+_this.polygonCenter.x, -_this.aabb.height/2+_this.polygonCenter.y, _this.aabb.width, _this.aabb.height);
				context.fillStyle = '#0f0';
				context.fill();
				context.closePath();
				
				for(t = 0; t < _this.triangulatedPolygon.length; t++) {
					triangle = _this.triangulatedPolygon[t];
					
					context.beginPath();
					for(v = 0; v < triangle.length; v++) {
						point = triangle[v];
						
						if(v === 0)
							context.moveTo(point.x, point.y);
						else
							context.lineTo(point.x, point.y);
							
					}
					
					context.lineTo(triangle[0].x, triangle[0].y);
					context.stroke();
					context.fillStyle = '#f00';
					context.fill();
					context.closePath();
				}

			});
			
		}
	};
	// END: Enemy
	
	// BEGIN: Init
	init: {
		var width;
		var height;
		
		context.canvas.width = canvas.clientWidth;
		context.canvas.height = canvas.clientHeight;
		
		width = canvas.clientWidth;
		height = canvas.clientHeight;
		
		player = new Player({
			position: {x: width/2, y: height/2}
		});
	}
	// END: Init
	
	// BEGIN: Events
	events : {
		$(window).on('mousemove', function(e) {
			mousePosition.x = e.clientX-$(canvas).offset().left;
			mousePosition.y = e.clientY-$(canvas).offset().top;
		});
		
		window.onmousedown = function(e) {
			console.log(e.which);
			
			switch(e.which) {
				case 1:
					player.fire();
					break;
				default:
					break;
			}
		};
	}
	// END: Events
	
	function update(){
		var angle = getAngleToPosition(player.position.x, player.position.y, mousePosition.x, mousePosition.y)*(180/Math.PI);
		var shortestAngle = getShortestAngle(player.rotation, angle); 
		var position;
		var angle;
		
		player.setRotation(angle);
		
		
		
		// Spawn moar enemies 
		if(Enemy.count < enemyMin) {
			angle = 360*Math.random();
			position = {x: 300 * Math.cos(angle * Math.PI/180) + player.position.x, y: 300 * Math.sin(angle * Math.PI/180) + player.position.y};
			new Enemy({
				position: position,
				rotation: 360*Math.random()
			});
		}
		
		// Update enemies 
		(function() {
			var enemyID;
			var enemy;
			
			for(enemyID in Enemy.enemies) {
				if(Enemy.enemies.hasOwnProperty(enemyID)) {
					enemy = Enemy.enemies[enemyID];
				}
				
			}
		})();
		
		// Update projectiles
		(function() {
			var prop;
			
			for(prop in Projectile.projectiles) {
				if(Projectile.projectiles.hasOwnProperty(prop)) {
					Projectile.projectiles[prop].update();
				}
			}
			
			Projectile.clean();
		})();
	};
	
	function redraw(){
		var i = 0;
		
		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		
		player.redraw();
		
		// Redraw enemies 
		(function() {
			var enemy;
			
			for(enemy in Enemy.enemies) {
				if(Enemy.enemies.hasOwnProperty(enemy)) {
					Enemy.enemies[enemy].redraw();
				}
			}
		})();
		
		// Redraw projectiles
		(function() {
			var prop;
			
			for(prop in Projectile.projectiles) {
				if(Projectile.projectiles.hasOwnProperty(prop)) {
					Projectile.projectiles[prop].redraw();
				}
			}
		})();
		
		window.requestAnimationFrame(function() {
			redraw();
		});
	};
	
	
	
	updateInterval = window.setInterval(function(){
		update();
	}, 1000/fps);

	window.requestAnimationFrame(function() {
		redraw();
	});
}