window.range = 50;
window.onload = function() {
	var mousePosition = {x: 0, y: 0};
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	var fps = 60;
	
	// BEGIN: Init
	init: {
		context.canvas.width = canvas.clientWidth;
		context.canvas.height = canvas.clientHeight;
	}
	// END: Init
	
	// BEGIN: Events
	events : {
		$(window).on('mousemove', function(e) {
			mousePosition.x = e.clientX-$(canvas).offset().left;
			mousePosition.y = e.clientY-$(canvas).offset().top;
		});
	}
	// END: Events
	
	function update(){};
	function redraw(){};
	
	
	updateInterval = window.setInterval(function(){
		update();
	}, 1000/fps);

	window.requestAnimationFrame(function() {
		//redraw();
	});
}