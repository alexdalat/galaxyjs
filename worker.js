function calc() {
	for(let i = 0; i < bodies.length; i++) {
		var body = bodies[i]

		body.oldpos = clone(body.pos)
		for(let s = 0; s < speed; s++) {
			if(body.moveable) {
				body.tick(lb, time_step)

				if(body.collisionCheck(lb, camera.scale) || body.pos.distance(lb.pos) >= killDist) {
					bodies = removeFromArray(body, bodies);
				}
			}
		}
	}
}

self.importScripts("util.js");
self.importScripts("vec2.js");
self.importScripts("Body.js");

self.addEventListener('message', function(o) {
	e = JSON.parse(o.data);
	e = argsToClass(e); // revive all classes!
	
	bodies = e.bodies
	config = e.config

	lb = e.lb
	time_step = e.time_step
	speed = e.speed
	G = e.G
	canvasCenter = e.canvasCenter
	killDist = e.killDist
	camera = e.camera


	calc();
	self.postMessage(JSON.stringify({bodies: bodies}))
}, false)


var classes = [vec2, Body];
var class_check_ignore = [""]

var class_types = [];
for(let i=0; i < classes.length; i++) {
    if(classes[i].__type__)
        class_types.push(classes[i].__type__)
    else
        throw new Error(`Type is undefined for ${classes[i].name}.`);
}